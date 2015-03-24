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
        logger.trace(sprintf.apply(this, arguments));
    },
    debug: function() {
        logger.debug(sprintf.apply(this, arguments));
    },
    info: function () {
        logger.info(sprintf.apply(this, arguments));
    },
    warn: function () {
        logger.warn(sprintf.apply(this, arguments));
    },
    error: function () {
        logger.error(sprintf.apply(this, arguments));
    },
    fatal: function () {
        logger.fatal(sprintf.apply(this, arguments));
    },
    getLogger: log4js.getLogger
};
