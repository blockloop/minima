(function(){
	var os = require('os');
	var path = require('path');

	var tmpFile = function() {
		return path.join(os.tmpdir(), (new Date()).getTime().toString());
	}

	exports.config = {
		allScriptsTimeout: 11000,
		seleniumAddress: 'http://127.0.0.1:4444/wd/hub',
		seleniumArgs: ['-browserTimeout=60'],
		chromeDriver: '../node_modules/chromedriver/bin/chromedriver',

		specs: [
			'e2e/app/**/*.e2e.js'
		],

		capabilities: {
			'phantomjs.binary.path': '../node_modules/phantomjs/bin/phantomjs',
			'phantomjs.cli.args': [ '--local-storage-path=' + tmpFile() ],
			'browserName': 'phantomjs',
			//'browserName': 'chrome',
		},

		stackTrace: true,

		baseUrl: 'http://localhost:8000',

		framework: 'jasmine',

		onPrepare: function() {
			//require('jasmine-spec-reporter');
			//var reporter = new jasmine.SpecReporter({
			//	displayStackTrace: false,
			//	includeStackTrace: false
			//});
			//jasmine.getEnv().addReporter(reporter);
		},

		jasmineNodeOpts: {
			includeStackTrace: false,
			defaultTimeoutInterval: 30000,
			reporters: ['jasmine-spec-reporter'],
		}
	};

}).call(this);

