// BASE SETUP
// =============================================================================

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var morgan = require("morgan");
var path = require("path");
var mongoose = require("mongoose");

// VARS
var STATIC_PATH = path.join(__dirname, "../web/public");
var port = process.env.PORT || 4000;

// configure app
app.use(morgan("dev")); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(STATIC_PATH));
console.log("Running statics from " + STATIC_PATH);

// setup db
mongoose.connect("mongodb://localhost:27017");
var router = require("./routes");

// REGISTER ROUTES
// =============================================================================
app.use("/api", router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Magic happens on port " + port);
