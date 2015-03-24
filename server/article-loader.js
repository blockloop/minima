var moment = require("moment");
var Post = require("./models/post");
var config = require("../app.config");
var logger = require("./logger");
var ArticleSource = require(config.articleMiddleware);
var articleSource = new ArticleSource(logger.getLogger(config.articleMiddleware));
var lastCheckDate = moment("1970-01-01");

module.exports = function() {
    this.loader = function(req, res, next) {
        next();
        if (!req.url.match(/.(css|js)$/)) {
            setTimeout(checkForRefresh);
        }
    };
};

checkForRefresh();

function checkForRefresh() {
    var diff = moment().diff(lastCheckDate, "minutes", true);

    if (diff > 10) {
        logger.info("It's been %s minutes since the last refresh. Doing refresh...", diff);
        lastCheckDate = Date.now();
        refresh();
    } else {
        logger.info("Next refresh in %s minutes", (10 - diff));
    }
}

function refresh() {
    articleSource.listPages(recieveArticle);
}

function recieveArticle(remote) {
    Post.findBySlug(remote.slug, function(err, locals) {
        if (err) { return logger.fatal(err); }
        var local = locals[0] || {};

        if (!local.modifiedDate || remote.modifiedDate > local.modifiedDate) {
            remote = extend(local, remote);

            articleSource.getPageContent(remote)
            .then(persistArticle, handleErr)
            .catch(handleErr);

        } else {
            logger.info("REMOTE %s: %s", remote.slug, moment(remote.modifiedDate).toDate());
            logger.info("LOCAL %s: %s", local.slug, local.modifiedDate);
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

function extend(left, right) {
    for (var key in right) {
        if (right.hasOwnProperty(key)) {
            left[key] = right[key];
        }
    }
    return left;
}

function handleErr(err) {
    throw err;
}
