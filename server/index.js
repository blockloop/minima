// BASE SETUP
// =============================================================================

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var morgan = require("morgan");

// configure app
app.use(morgan("dev")); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017");
var router = require("./routes");

// REGISTER OUR ROUTES -------------------------------
app.use("/api", router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Magic happens on port " + port);
