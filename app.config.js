var extend = require("extend");

var default_ = {
    rootUrl: "http://localhost:4000/",
    author: {
        name: "Brett Jones"
    },
    prettyDateFormat: "MMMM D, YYYY",
    articleMiddleware: "minima-evernote-loader",
    refreshEveryMins: 0,

    "minima-evernote-loader": {
        notebookName: "minima",
        authToken: "***REMOVED***"
    }
};

var production = extend(true, default_, {
    rootUrl: "http://brettj.me",
    refreshEveryMins: 5
});

module.exports = getForEnv(process.env.NODE_ENV);

function getForEnv(env) {
    return (env === "production") ? production : default_;
}
