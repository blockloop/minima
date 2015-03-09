var express = require("express");
var router = new express.Router();
var glob = require("glob");

module.exports = router;

//
// load route handlers
//
glob.sync("./handlers/*.js", {cwd: __dirname}).forEach(function(handler){
    require(handler)(router);
});

