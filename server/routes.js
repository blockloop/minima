var express = require("express");
var router = new express.Router();
var glob = require("glob");

module.exports = router;

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get("/", function(req, res) {
    res.json({ message: "hooray! welcome to our api!" });
});

//
// load route handlers
//
glob.sync("./handlers/*.js", {cwd: __dirname}).forEach(function(handler){
    require(handler)(router);
});

