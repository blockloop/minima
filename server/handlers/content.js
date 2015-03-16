var Post = require("../models/post");

module.exports = function(router) {
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
                    return post;
                });
                res.render("posts", { posts: postsWithSummaries });
            }
        });
    });

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
