var log4js = require('log4js');
var util = require('util');
var config = require('../app.config');

log4js.configure({
    appenders: [
        { type: 'console' },
        {
            type: 'file',
            filename: 'logs/minima.txt',
            category: 'minima'
        },
        {
            type: 'file',
            filename: 'logs/' + config.articleMiddleware + '.txt',
            category: config.articleMiddleware
        }
    ]
});
log4js.replaceConsole();

var logger = log4js.getLogger('minima');
var middlewareLogger = log4js.getLogger(config.articleMiddleware);

if (process.env.NODE_ENV === 'production') {
    logger.setLevel('WARN');
    middlewareLogger.setLevel('WARN');
} else {
    logger.setLevel('TRACE');
    middlewareLogger.setLevel('TRACE');
}

module.exports = {
    trace: function() {
        log('trace', arguments);
    },
    debug: function() {
        log('debug', arguments);
    },
    info: function () {
        log('info', arguments);
    },
    warn: function () {
        log('warn', arguments);
    },
    error: function () {
        log('error', arguments);
    },
    fatal: function () {
        log('fatal', arguments);
    },
    getLogger: log4js.getLogger
};

function log(level, args) {
    var params = args ? Array.prototype.slice.call(args) : [];

    if (typeof params[0] === 'string' || params[0] instanceof String) {
        if (params.length > 1) {
            logger[level](util.format.apply(null, args));
        } else {
            logger[level](params[0]);
        }
    } else {
        logger[level](util.inspect(params, {colors: true}));
    }
}
