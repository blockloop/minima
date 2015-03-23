var Post = require("../models/post");
var moment = require("moment");

module.exports = function(router) {
    // route to show list of posts showing newest first
    router.route("/").get(function(req, res){
        Post.find(function(err, posts) {
            if (err) {
                res.send(err);
            } else {
                var postsWithSummaries = posts.map(function(post){
                    if (!post.summary) {
                        var raw = post.content
                            .replace(/<[^>]+>/g, "")
                            .replace(/\s+/g, " ");
                        post.summary = raw.substr(0, 200);
                    }
                    post.prettyDate = moment(post.createDate).format("MMMM D, YYYY");
                    return post;
                });
                res.render("posts", { posts: postsWithSummaries });
            }
        });
    });

    // route to show each individual post
    router.route(/[a-z-]+/).get(function(req, res, next) {
        var slug = req.path.replace("/", "");
        Post.findBySlug(slug, function(err, post) {
            post = (post || [])[0];

            if (!post) {
                next();
            } else if (err) {
                res.send(err);
            } else {
                res.render("post", { post: post });
            }
        });
    });


};
