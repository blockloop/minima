var moment = require("moment");
var Post = require("../models/post");
var config = require("../app.config");
var articleMiddleware = require(config.articleMiddleware);

var lastCheckDate = moment();

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

function recieveArticle(article) {
    Post.findBySlug(article.slug, function(err, found) {
        if (err) {
            console.error(err);
        } else if (found.length === 1) {
            var updated = extend(found, article);
            persistArticle(updated);
        } else {
            persistArticle(article);
        }
    });
}

function persistArticle(article) {
    var post = new Post(article);

    post.save(function(err) {
        if (err) {
            console.error(err);
        } else {
            console.log("new post saved. Title: %s", post.title);
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
