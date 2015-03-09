/**
 * Created by bjones on 12/19/14.
 */
var fs = require('fs');
var ptor = protractor;
var baseUrl = ptor.baseUrl;

module.exports = {
	navigate: navigate,
	createNote: createNote,
	deleteNote: deleteNote,
	screenShot: screenShot,
	syncNotes: syncNotes
};

function navigate(path) {
	if (path == null) {
		path = '/';
	}
	ptor.get("" + baseUrl + path);
	return ptor.waitForAngular();
}

function createNote(args) {
	if (args == null) {
		args = {};
	}
	if (args.body == null) {
		args.body = 'body';
	}
	if (args.tag == null) {
		args.tag = 'tag';
	}
	element(by.id('new-note-btn')).click();
	element(by.model('selectedNote().body')).sendKeys(args.body);
	element(by.model('newTag')).sendKeys(args.tag);
	element(by.model('newTag')).sendKeys(protractor.Key.ENTER);
}

function deleteNote(index) {
	element.all(by.repeater('note in filteredNotes()')).get(index).click();
	return element(by.id('delete-note-btn')).click();
}

function screenShot(filename) {
	if (filename == null) {
		filename = "" + ((new Date()).getTime()) + ".png";
	}
	filename = "/tmp/" + filename + "/";
	return browser.takeScreenshot().then(function(png) {
		var stream;
		stream = fs.createWriteStream(filename);
		stream.write(new Buffer(png, 'base64'));
		return stream.end();
	});
}

function syncNotes () {
	element(by.id('sync-notes-btn')).click();
	return ptor.waitForAngular();
}


