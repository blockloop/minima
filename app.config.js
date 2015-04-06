var extend = require('extend');

var default_ = {
    rootUrl: 'http://localhost:4000/',
    author: {
        name: 'Brett Jones'
    },
    prettyDateFormat: 'MMMM D, YYYY',
    articleMiddleware: 'minima-evernote-loader',
    refreshEveryMins: 0,

    admin: {
        username: 'brett',
        password: '***REMOVED***'
    },

    'minima-evernote-loader': {
        notebookName: 'minima',
        key: 'brettof86-5633',
        secret: '17cedd1f80ba7e24',
        sandbox: false
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
