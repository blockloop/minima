var moment = require("moment");
var Post = require("./models/post");
var config = require("../app.config");
var articleMiddleware = require(config.articleMiddleware);
// var Q = require("q");

var lastCheckDate = moment("1970-01-01");

module.exports = function(req, res, next) {
    if (!req.url.match(/.(css|js)$/)) {
        setTimeout(checkForRefresh);
    }
    next();
};

checkForRefresh();

function checkForRefresh() {
    var diff = moment().diff(lastCheckDate, "minutes", true);

    if (diff > 10) {
        console.log("Doing refresh...");
        refresh();
    } else {
        console.log("Next refresh in %s minutes", (10 - diff));
    }
}

function refresh() {
    articleMiddleware.listPages(recieveArticle);
}

function recieveArticle(remote) {
    Post.findBySlug(remote.slug, function(err, locals) {
        if (err) { return console.error(err); }
        var local = locals[0] || {};

        if (!local.modifiedDate || remote.modifiedDate > local.modifiedDate) {
            remote = extend(local, remote);

            articleMiddleware.getPageContent(remote)
            .then(persistArticle, handleErr)
            .catch(handleErr);

        } else {
            console.log("REMOTE %s: %s", remote.slug, moment(remote.modifiedDate).toDate());
            console.log("LOCAL %s: %s", local.slug, local.modifiedDate);
            console.log("%s is already the latest version", remote.slug);
        }
    });
}

function persistArticle(article) {
    var post = new Post(article);
    post.markModified("modifiedDate");
    var upsert = post.toObject();
    console.log("persisting '%s': %s", article.slug, upsert.title);
    delete upsert._id;

    Post.findOneAndUpdate({slug: article.slug}, upsert, {upsert: true}, function(err) {
        if (err) {
            console.error(err);
        } else {
            console.log("post saved. Title: %s", upsert.title);
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
