"use strict";

var moment = require("moment");
var Post = require("./models/post");
var config = require("../app.config");
var logger = require("./logger");
var extend = require("extend");

var ArticleSource = require(config.articleMiddleware);
var middlewareLogger = logger.getLogger(config.articleMiddleware);
var middlewareConfig = config[config.articleMiddleware];
var articleSource = new ArticleSource(middlewareLogger, middlewareConfig);

var lastCheckDate = moment("1970-01-01");
var isBackground = config.refreshEveryMins > 0;

module.exports = function() {
    this.loader = function(req, res, next) {
        next();
        if (!req.url.match(/.(css|js)$/) && !isBackground) {
            checkForRefresh();
        }
    };
};

refresh();

if (isBackground) {
    setInterval(checkForRefresh, config.refreshEveryMins * 60 * 1000);
}

function checkForRefresh() {
    var minsSinceLastRun = moment().diff(lastCheckDate, "minutes", true);

    if (minsSinceLastRun >= config.refreshEveryMins) {
        logger.info("Last refresh was %s. Refreshing...", moment(lastCheckDate).fromNow());
        refresh();
    }
}

function refresh() {
    lastCheckDate = Date.now();
    try {
        articleSource.listPages(receiveArticle);
    } catch (e) {
        logger.fatal(e);
    }
}

function receiveArticle(remote) {
    Post.findBySlug(remote.slug, function(err, locals) {
        if (err) { return logger.fatal(err); }

        var local = locals[0];

        if (remote.unpublished === true) {
            if (local == null) { return null; }
            logger.trace("unpublishing %s", remote.title);
            removePost(local);
        } else if (!local || remote.modifiedDate > local.modifiedDate) {
            remote = extend(true, local || {}, remote);

            articleSource.getPageContent(remote)
                .then(persistArticle, logger.err)
                .catch(logger.err);
        } else {
            logger.trace("REMOTE %s: %s", remote.slug, moment(remote.modifiedDate).toDate());
            logger.trace("LOCAL %s: %s", local.slug, local.modifiedDate);
            logger.info("%s is already the latest version", remote.slug);
        }
    });
}

function persistArticle(article) {
    var post = new Post(article);
    post.markModified("modifiedDate");
    var upsert = post.toObject();
    logger.info("persisting '%s': %s", article.slug, upsert.title);
    delete upsert._id;

    Post.findOneAndUpdate({slug: article.slug}, upsert, {upsert: true}, function(err) {
        if (err) {
            logger.fatal(err);
        } else {
            logger.info("post saved. Title: %s", upsert.title);
        }
    });
}

function removePost(post) {
    Post.remove({ slug: post.slug }, function(err) {
        if (err) {
            logger.error("ERROR removing %s which was marked unpublished", post.title);
        } else {
            logger.trace("successfully unpublished %s", post.title);
        }
    });
}
