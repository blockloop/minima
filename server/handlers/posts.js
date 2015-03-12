var Post = require("../models/post");

module.exports = function(router) {
    router.route("/posts")

    // create a post (accessed at POST http://localhost:8080/posts)
    .post(function(req, res) {
        var post = new Post(req.body);

        post.save(function(err) {
            if (err) { res.send(err); }

            res.json({ message: "Post created!" });
        });

    })

    // get all the posts (accessed at GET http://localhost:8080/api/posts)
    .get(function(req, res) {

        // Post.remove(function(err){
        //     if (err) { res.send(err); }
        //     res.send({message: "ok"});
        // });

        Post.find(function(err, posts) {
            if (err) {
                res.send(err);
            }

            res.json(posts);
        });

    });

    // on routes that end in /posts/:slug
    // ----------------------------------------------------
    router.route("/posts/:slug")

    // GET /posts/:slug
    .get(function(req, res) {
        Post.findBySlug(req.params.slug, function(err, post) {
            if (err) { res.send(err); }
            res.json((post || [])[0]);
        });
    })

    // DELETE /posts/:id
    .delete(function(req, res) {
        Post.findByIdAndRemove(req.params.id, function(err) {
            if (err) { res.send(err); }
            res.json({ message: "ok" }, 202);
        });
    })

    // PUT /posts/:id
    .put(function(req, res) {
        Post.findById(req.params.id, function(err, post) {

            if (err) {
                res.send(err);
            }

            post.name = req.body.name;
            post.save(function(err_) {
                if (err_) {
                    res.send(err);
                }

                res.json({ message: "Post updated!" });
            });

        });
    });

};
