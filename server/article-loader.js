'use strict';

var moment = require('moment');
var Post = require('./models/post');
var config = require('../app.config');
var logger = require('./logger');
var extend = require('extend');
var Path = require('path');
var Store = require('./store');

var middlewareConfig = extend(true, {}, config[config.articleMiddleware], {
    callbackUrl: Path.join(config.rootUrl, 'admin/connect_callback')
        .replace('\\', '/')
});

var articleStore = new Store(config.articleMiddleware);

logger.info('using %s middleware', config.articleMiddleware);
var ArticleSource = require(config.articleMiddleware);
var middlewareLogger = logger.getLogger(config.articleMiddleware);
var articleSource = new ArticleSource(middlewareLogger, middlewareConfig, articleStore);

var lastCheckDate = moment('1970-01-01');
var isBackground = config.refreshEveryMins > 0;

module.exports = function() {
    this.loader = function(req, res, next) {
        next(); // no need to wait on refresh to render the page
        if (!req.url.match(/.(css|js)$/) && !isBackground) {
            checkForRefresh();
        }
    };

    this.connect = articleSource.connect;

    this.connectCallback = articleSource.connectCallback;

    if (isBackground) {
        logger.info('running refresh in the background every %s minute(s)', config.refreshEveryMins);
        setInterval(checkForRefresh, config.refreshEveryMins * 60 * 1000);
    }

    refresh();
};


/********************
 * PRIVATE
 ********************/

function checkForRefresh() {
    var minsSinceLastRun = moment().diff(lastCheckDate, 'minutes', true);

    if (minsSinceLastRun >= config.refreshEveryMins) {
        logger.info('last refresh was %s. refreshing now...', moment(lastCheckDate).fromNow());
        refresh();
    }
}

function refresh() {
    lastCheckDate = Date.now();
    try {
        articleSource.listPages(receiveArticle);
    } catch (e) {
        logger.fatal('ERROR refreshing: %s', e.stack);
    }
}

function receiveArticle(remote) {
    logger.trace('receiving article: %s', JSON.stringify(remote));

    Post.findByIdentifier(remote.identifier, function(err, locals) {
        if (err) {
            return logger.fatal(err);
        }
        var local = locals[0];

        if (remote.unpublished) {
            if (!local) {
                return null;
            }
            logger.trace('unpublishing %s', remote.title);
            removePost(local);
        } else if (!local || remote.modifiedDate > local.modifiedDate) {
            var extended = extend(true, local || {}, remote);

            articleSource.getPageContent(extended)
                .done(persistArticle);
        } else {
            logger.info('%s is already the latest version', remote.slug);
        }
    });
}

function persistArticle(article) {
    var post = new Post(article);
    post.markModified('modifiedDate');
    var upsert = post.toObject();
    logger.info('persisting "%s": %s', article.slug, upsert.title);
    delete upsert._id;

    Post.findOneAndUpdate({slug: article.slug}, upsert, {upsert: true}, function(err) {
        if (err) {
            logger.error(err);
        } else {
            logger.info('post saved. Title: %s', upsert.title);
        }
    });
}

function removePost(post) {
    Post.remove({ slug: post.slug }, function(err) {
        if (err) {
            logger.error('ERROR removing %s which was marked unpublished', post.title);
        } else {
            logger.info('successfully unpublished %s', post.title);
        }
    });
}
