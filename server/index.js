// BASE SETUP
// =============================================================================

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var morgan = require("morgan");
var path = require("path");
var mongoose = require("mongoose");

// VARS
var STATIC_PATH = path.join(__dirname, "../views/assets/");
var port = process.env.PORT || 4000;

// configure app
app.use(morgan("dev")); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "jade");

// set locals
app.locals.moment = require("moment");

// setup db
mongoose.connect("mongodb://localhost:27017");
var router = require("./routes");
app.use(express.static(STATIC_PATH));


// DEV
if (process.env.NODE_ENV !== "production") {
    require("express-livereload")(app, {
        watchDir: STATIC_PATH
    });
}

// REGISTER ROUTES
// =============================================================================
app.use("/", router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Magic happens on port " + port);
