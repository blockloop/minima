var log4js = require("log4js");
var sprintf = require("sprintf-js").sprintf;
var config = require("../app.config");

log4js.configure({
    appenders: [
        { type: "console" },
        {
            type: "file",
            filename: "logs/minima.txt",
            category: "minima"
        },
        {
            type: "file",
            filename: "logs/" + config.articleMiddleware + ".txt",
            category: config.articleMiddleware
        }
    ]
});
log4js.replaceConsole();

var logger = log4js.getLogger("minima");

if (process.env.NODE_ENV === "production") {
    logger.setLevel("WARN");
} else {
    logger.setLevel("TRACE");
}

module.exports = {
    trace: function() {
        log("trace", arguments);
    },
    debug: function() {
        log("debug", arguments);
    },
    info: function () {
        log("info", arguments);
    },
    warn: function () {
        log("warn", arguments);
    },
    error: function () {
        log("error", arguments);
    },
    fatal: function () {
        log("fatal", arguments);
    },
    getLogger: log4js.getLogger
};

function log(level, args) {
    var params = args ? Array.prototype.slice.call(args) : [];

    if (params.length > 1 && (typeof params[1] === "string" || params[1] instanceof String)) {
        logger[level](sprintf.apply(null, args));
    } else {
        logger[level](JSON.stringify(params, true))
    }
}
