/* global complete, desc, file, task, fail */

var jake = require("jake");
var chalk = require("chalk");
var Path = require("path");
var sh = require("shelljs");
var log = jake.logger.log;
var CLIEngine = require("eslint").CLIEngine;
var lintCli = new CLIEngine({});

sh.mkdir("-p", "web/public/fonts");

/** DIST is just a key used to decide if we should minify */
var DIST = process.env.dist && (process.env.dist !== "");

jake.on("complete", function() {
    var dt = (new Date()).toLocaleTimeString();
    log("[" + dt + "] " + chalk.green("Jake complete."));
});

/**
 * SCRIPTS
 * Note: put the app.js file first because it needs to be loaded before anything
 */
var inputJsFiles = fileList(["web/src/app.js", "web/src/**/*.js"]);


/** list of libraries in dependant order */
var inputLibJsFiles = fileList([
    "web/lib/angular/angular.js",
    "web/lib/angular-ui-router/release/angular-ui-router.js",
    "web/lib/angular-sanitize/angular-sanitize.min.js",
    "web/lib/moment/moment.js"
]);

/** loop input script files, create output rules, and store them
 * as a list. The list is used for minification and injecting
 * script and css tags into the index.html file */
var outputJsFiles = inputJsFiles.map(function(source) {
    var dest = outputFile(source);
    desc("build " + dest);
    file(dest, [source], {async: false}, buildJsFile);
    return dest;
});

/** lib scripts get shoved into a lib.js file for development */
var outputLibJsFiles = outputFile("lib.js");
/** /SCRIPTS */

/** STYLES */
var inputCssFiles = fileList([
    "web/src/app.less",
    "web/src/**/*.less"
]);

var inputLibCssFiles = fileList([
    "web/src/assets/poole.min.css",
    "web/src/assets/lanyon.min.css",
    "web/lib/font-awesome/css/font-awesome.min.css",
    "web/lib/pure/pure-min.css"
]);

var outputCssFiles = inputCssFiles.map(function(source) {
    var dest = outputFile(source).replace(".less", ".css");
    desc("build " + dest);
    file(dest, [source], {async: true}, buildLessFile);
    return dest;
});

var outputLibCss = outputFile("lib.css");
/** /STYLES */

/** VIEWS */
var inputHtmlFiles = fileList(["web/src/index.html", "web/src/**/*.html"]);

var outputHtmlFiles = inputHtmlFiles.map(function(source) {
    var dest = outputFile(source);
    desc("build " + dest);
    file(dest, [source], {async: false}, buildHtmlFile);
    return dest;
});
/** VIEWS */

/** FONTS */
var inputFontFiles = fileList(["web/lib/font-awesome/fonts/*.*"]);

var outputFontFiles = inputFontFiles.map(function(source){
    var dest = outputFile(source, "fonts");
    desc("build " + dest);
    file(dest, [source], {async: false}, buildFonts);
    return dest;
});
/** /FONTS */

desc("Builds assets for development");
task("build", ["js", "less", "fonts", "html"]);

task("clean", function(){
    display(chalk.red("[CLEAN]"));
    sh.rm("-Rf", ["web/public/*"]);
    if (process.env.all) {
        sh.rm("-Rf", "web/lib/*");
    }
    logOk();
});

task("default", ["build"]);

desc("Build all js files");
task("js", outputJsFiles.concat(outputLibJsFiles), function(){
    if (DIST) { minifyJs(); }
});

desc("Build all less files");
task("html", outputHtmlFiles);

desc("Build all less files");
task("less", outputCssFiles.concat(outputLibCss), function(){
    if (DIST) { minifyCss(); }
});

desc("Builds lib.js from lib files");
file(outputLibJsFiles, inputLibJsFiles, function () {
    display(chalk.cyan("[JS] ") + this.name);
    sh.cat(inputLibJsFiles).to(this.name);
    logOk();
});

desc("Builds lib.css from lib files");
file(outputLibCss, inputLibCssFiles, function () {
    display(chalk.cyan("[CSS] ") + this.name);
    sh.cat(inputLibCssFiles).to(this.name);
    logOk();
});

desc("copy fonts to dist directory");
task("fonts", outputFontFiles);


/**
 * UTILITIES
 */

function buildJsFile() {
    var source = this.prereqs[0];
    var contents = sh.cat(source);
    lintJsFile(contents, source);
    display(chalk.cyan("[JS] ") + this.name);
    var ngAnnotate = require("ng-annotate");
    var result = ngAnnotate(contents, {
        add: true,
        remove: true
    });
    if (result.errors) {
        logFail();
        return fail(chalk.red(result.errors));
    }
    var wrapped = "(function(){ " + result.src + " })();";

    // if this file is new then the index.html needs to be
    // updated because a new script tag is needed
    if (!sh.test("-f", this.name)) {
        sh.exec("touch web/src/index.html");
    }

    wrapped.to(this.name);
    logOk();
}

function lintJsFile(contents, source) {
    display(chalk.cyan("[JS LINT] ") + source);
    var report = lintCli.executeOnFiles([source]);
    var result = report.results[0];
    var severities = result.messages.map(function(item) {
        return item.severity;
    });
    var level = severities.reduce(function(highest, current) {
        return Math.max(highest, current);
    }, 0);

    if (level === 0) {
        logOk();
    } else if (level === 1) {
        logWarn();
    } else {
        logFail();
    }

    result.messages.forEach(function(message){
        if (message.fatal) {
            return log(chalk.red(message.message));
        }
        var levelLabel = message.severity === 2 ? chalk.red("error") : chalk.yellow("warn");
        var msg = chalk.grey("  " + message.line + ":" + message.column) + "\t" + levelLabel +
            "  " + message.message + "\t" + chalk.grey(message.ruleId);
        log(msg);
    });

    if (level > 1) {
        fail("One or more lint errors occured. See above");
    }
}

function buildLessFile() {
    display(chalk.cyan("[LESS] ") + this.name);
    var dest = this.name;
    var source = this.prereqs[0];
    var less = require("less");
    less.render(sh.cat(source), {
        filename: source, // Specify a filename, for better error messages
        compress: true // Minify CSS output
    }, function (e, result) {
        if (e != null) {
            logFail();
            return fail(chalk.red(e));
        }

        // if this file is new then the index.html needs to be
        // updated because a new link tag is needed
        if (!sh.test("-f", dest)) {
            sh.exec("touch web/src/index.html");
        }

        result.css.to(dest);
        logOk();
        complete();
    });
}

function buildHtmlFile() {
    display(chalk.cyan("[HTML] ") + this.name);
    var dest = this.name;
    var source = this.prereqs[0];
    var contents = sh.cat(source);

    if (dest.indexOf("index.html") > -1) {
        contents = templatizeIndexHtml(contents);
    }
    contents.to(dest);
    logOk();
}

function buildFonts(){
    display(chalk.cyan("[FONT] ") + this.name);
    sh.mkdir("-p", Path.dirname(this.name));
    sh.cp("-f", this.prereqs[0], this.name);
    logOk();
}

function templatizeIndexHtml(contents) {
    var allJs = [outputLibJsFiles].concat(outputJsFiles);
    var jsScriptTags = allJs.map(function(js) {
        var name = Path.basename(js);
        return '<script src="/' + name + '"></script>';
    });

    var allCss = ["lib.css"].concat(outputCssFiles);
    var cssTags = allCss.map(function(css) {
        var name = Path.basename(css);
        return '<link rel="stylesheet" type="text/css" href="/' + name + '"/>';
    });

    return contents
        .replace(/<!-- build:js-->(\s)*?<!-- endbuild-->/, jsScriptTags.join("\n"))
        .replace(/<!-- build:css-->(\s)*?<!-- endbuild-->/, cssTags.join("\n"));
}

function fileList(includes, excludes) {
    excludes = excludes || [];

    var list = new jake.FileList();
    includes.forEach(function(file) {
        list.include(file);
    });
    excludes.forEach(function(file) {
        list.exclude(file);
    });

    return list.toArray();
}

function outputFile(file, prefix) {
    prefix = prefix || "";
    var dir = "web/public";
    dir = prefix.length === 0 ? dir : dir + "/" + prefix;
    return dir + "/" + Path.basename(file);
}

function display(text) {
    process.stdout.write(text + "...");
}

function logOk() {
    log(chalk.green("[OK]"));
}

function logWarn() {
    log(chalk.yellow("[WARN]"));
}

function logFail() {
    log(chalk.red("[FAIL]"));
}

function removeFile(file){
    display(chalk.cyan("[DEL] ") + file);
    sh.rm(file);
    logOk();
}

function minifyJs() {
    var dest = outputFile("app.min.js");
    display(chalk.cyan("[JS] ") + dest + " ...");
    var UglifyJS = require("uglify-js");
    var fileContents = sh.cat(outputJsFiles);
    var uglifiedJs = UglifyJS.minify(fileContents, {
        fromString: true,
        mangle: true,
        compress: true
    });
    var allJs = sh.cat(outputLibJsFiles) + uglifiedJs.code;
    allJs.to(dest);
    logOk();
    outputJsFiles.concat(outputLibJsFiles).forEach(removeFile);
}

function minifyCss() {
    var dest = outputFile("app.min.css");
    display(chalk.cyan("[CSS] ") + dest + " ...");
    var mincss = require("mincss");
    var fileContents = sh.cat(outputCssFiles);
    var allCss = sh.cat(outputLibCss) + mincss.minify(fileContents).css;
    allCss.to(dest);
    logOk();
    outputCssFiles.concat(outputLibCss).forEach(removeFile);
}
