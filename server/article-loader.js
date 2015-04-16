'use strict';

var moment = require('moment');
var Post = require('./models/post');
var config = require('../app.config');
var log = require('./logger');
var extend = require('extend');
var Path = require('path');
var store = require('./store');
var util = require('util');

var middlewareConfig = extend(true, {}, config[config.articleMiddleware], {
    callbackUrl: Path.join(config.rootUrl, 'admin/connect_callback')
        .replace('\\', '/')
});


var articleSource;
log.info('using %s middleware', config.articleMiddleware);
store(config.articleMiddleware).done(function(db) {
    var ArticleSource = require(config.articleMiddleware);
    var middlewareLogger = log.getLogger(config.articleMiddleware);
    articleSource = new ArticleSource(middlewareLogger, middlewareConfig, db);

    if (articleSource.isConnected()) {
        log.trace('middleware is connected. Refreshing...');
        refresh();
    }
});


var lastCheckDate = moment('1970-01-01');
var isBackground = config.refreshEveryMins > 0;

module.exports = function() {
    this.loader = function(req, res, next) {
        next(); // no need to wait on refresh to render the page
        if (!req.url.match(/.(css|js)$/) && !isBackground) {
            checkForRefresh();
        }
    };

    // this is wrapped this way because trying to directly assign it
    // causes an error because articleSource is not yet defined
    this.connect = function() {
        log.trace('connecting %s', config.articleMiddleware);
        articleSource.connect.apply(this, arguments);
    };

    // this is wrapped this way because trying to directly assign it
    // causes an error because articleSource is not yet defined
    this.connectCallback = function() {
        log.trace('connectCallback triggered for %s', config.articleMiddleware);
        articleSource.connectCallback.apply(this, arguments);
    };

    // this is wrapped this way because trying to directly assign it
    // causes an error because articleSource is not yet defined
    this.isConnected = function() {
        return articleSource.isConnected();
    };

    if (isBackground) {
        log.info('running refresh in the background every %s minute(s)', config.refreshEveryMins);
        setInterval(checkForRefresh, config.refreshEveryMins * 60 * 1000);
    }
};


/********************
 * PRIVATE
 ********************/

function checkForRefresh() {
    if (articleSource && articleSource.isConnected()) {
        return;
    }

    var minsSinceLastRun = moment().diff(lastCheckDate, 'minutes', true);

    if (minsSinceLastRun >= config.refreshEveryMins) {
        log.info('last refresh was %s. refreshing now...', moment(lastCheckDate).fromNow());
        refresh();
    }
}

function refresh() {
    lastCheckDate = Date.now();
    try {
        articleSource.listPages(receiveArticle);
    } catch (e) {
        log.fatal('ERROR refreshing: %s', e.stack);
    }
}

function receiveArticle(remote) {
    log.trace('receiving article: %s', util.inspect(remote));

    Post.findByIdentifier(remote.identifier, function(err, locals) {
        if (err) {
            return log.fatal(err);
        }
        var local = locals[0];

        if (remote.unpublished) {
            if (!local) {
                return null;
            }
            log.trace('unpublishing %s', remote.title);
            removePost(local);
        } else if (!local || remote.modifiedDate > local.modifiedDate) {
            var extended = extend(true, local || {}, remote);

            articleSource.getPageContent(extended)
                .done(persistArticle);
        } else {
            log.info('%s is already the latest version', remote.slug);
        }
    });
}

function persistArticle(article) {
    var post = new Post(article);
    post.markModified('modifiedDate');
    var upsert = post.toObject();
    log.info('persisting "%s": %s', article.slug, upsert.title);
    delete upsert._id;

    Post.findOneAndUpdate({slug: article.slug}, upsert, {upsert: true}, function(err) {
        if (err) {
            log.error(err);
        } else {
            log.info('post saved. Title: %s', upsert.title);
        }
    });
}

function removePost(post) {
    Post.remove({ slug: post.slug }, function(err) {
        if (err) {
            log.error('ERROR removing %s which was marked unpublished', post.title);
        } else {
            log.info('successfully unpublished %s', post.title);
        }
    });
}
