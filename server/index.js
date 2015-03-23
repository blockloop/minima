// BASE SETUP
// =============================================================================

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var morgan = require("morgan");
var path = require("path");
var mongoose = require("mongoose");
var ArticleLoader = require("./article-loader");
var articleLoader = new ArticleLoader();


// VARS
var STATIC_PATH = path.join(__dirname, "../static/");
var PORT = process.env.PORT || 4000;

// configure app
app.use(articleLoader.loader);
app.use(morgan("dev")); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "jade");

// set locals
app.locals.moment = require("moment");
app.locals.config = require("../app.config.js");

// setup db
mongoose.connect("mongodb://localhost:27017");
var router = require("./routes");
app.use(express.static(STATIC_PATH));


// DEV
if (process.env.NODE_ENV !== "production") {
    require("express-livereload")(app, {
        watchDir: "../views"
    });
}

// REGISTER ROUTES
// =============================================================================
app.use("/", router);


// START THE SERVER
// =============================================================================
app.listen(PORT);
console.log("Listening at http://localhost:" + PORT);
