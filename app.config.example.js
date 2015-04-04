var extend = require('extend');

var default_ = {
    rootUrl: 'http://localhost:4000/',
    author: {
        name: 'Brett Jones'
    },
    prettyDateFormat: 'MMMM D, YYYY',
    articleMiddleware: 'minima-dropbox-loader',
    refreshEveryMins: 0.5,

    admin: {
        username: 'brett',
        password: '***REMOVED***'
    },

    'minima-evernote-loader': {
        notebookName: 'minima',
        authToken: '***REMOVED***'
    },

    'minima-dropbox-loader': {
        folder: 'minima',
        key: '',
        secret: '',
        authToken: '***REMOVED***',
        filter: function(file) {
            return true;
        }
    }


};

var production = extend(true, {}, default_, {
    rootUrl: 'http://brettj.me',
    refreshEveryMins: 5
});

module.exports = (process.env.NODE_ENV === 'production') ? production : default_;
