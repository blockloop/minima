module.exports = function(config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: "../server/",

        // Plugins to load
        plugins: [
            "karma-*",
        ],

        // frameworks to use
        frameworks: [
            "jasmine",
            "sinon-chai",
            "chai",
        ],


        // list of files / patterns to load in the browser
        files: [
            "**/*.js",
            // Specs
            "../test/unit/**/*.spec.js"
        ],


        // list of files to exclude
        exclude: [
            "index.js",
        ],


        // test results reporter to use
        // possible values: "dots", "progress", "junit", "growl", "coverage"
        reporters: ["spec"],


        // web server port
        port: 9876,


        // cli runner port
        runnerPort: 9100,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG
        //logLevel: karma.LOG_DEBUG,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // Start these browsers, currently available:
        // browsers: ["ChromeCanary"],
        // browsers: ["Firefox"],
        // browsers: ["Opera"],
        // browsers: ["Safari"], // Mac only
        // browsers: ["IE"], // Windows only
        browsers: ["PhantomJS"],
        // browsers: ["Chrome"],


        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 10000,


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
