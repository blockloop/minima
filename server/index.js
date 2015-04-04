// BASE SETUP
// =============================================================================
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');
var path = require('path');
var mongoose = require('mongoose');
var ArticleLoader = require('./article-loader');
var logger = require('./logger');
var sprintf = require('sprintf-js').sprintf;

var articleLoader = new ArticleLoader();

// VARS
var STATIC_PATH = path.join(__dirname, '../static/');
var HOSTNAME = process.env.HOSTNAME || 'localhost';
var PORT = process.env.PORT || 4000;
var isProd = process.env.NODE_ENV === 'production';

// configure app
app.use(articleLoader.loader);

app.use(morgan({
    format: isProd ? 'tiny' : 'dev',
    skip: function (req, res) {
        return isProd && res.statusCode < 400;
    },
    stream: {
        write: isProd ? logger.error : logger.info
    }
})); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'jade');

// set locals
app.locals.moment = require('moment');
app.locals.config = require('../app.config');

// setup db
mongoose.connect('mongodb://localhost:27017/minima');
var router = require('./routes');
app.use(express.static(STATIC_PATH, {
    maxAge: isProd ? 1000 * 60 * 60 : 0 // 60 mins
}));


// DEV
if (process.env.NODE_ENV !== 'production') {
    require('express-livereload')(app, {
        watchDir: '../views'
    });
}

// REGISTER ROUTES
// =============================================================================
app.use('/', router);


// LAST ERROR HANDLER
// =============================================================================
app.use(function(err, req, res, next) {
    if (err) {
        var msg = sprintf('%s\n%s', err.message, err.stack);
        logger.error(msg);
        res.status(500);

        if (isProd) {
            // TODO create a pretty error page
            res.end('500: An error occured');
        } else {
            res.end(msg);
        }
    } else {
        next();
    }
});


// START THE SERVER
// =============================================================================
app.listen(PORT, HOSTNAME, function(){
    logger.info('Listening at http://%s:%s', HOSTNAME, PORT);
});
