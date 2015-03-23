/* eslint new-cap: [0] */

/**
 * https://dev.evernote.com/doc/reference/NoteStore.html#Struct_NoteFilter
 * https://dev.evernote.com/doc/reference/NoteStore.html#Fn_NoteStore_findNotesMetadata
 */
var slug = require("slug");
var Evernote = require("evernote").Evernote;
var enml = require("enml-js");

var authToken = "***REMOVED***";
var client = new Evernote.Client({token: authToken, sandbox: true});
// var userStore = client.getUserStore();
var noteStore = client.getNoteStore();
var notebookName = "minima";
var notebookGuid = null;
var moment = require("moment");
var markdown = require("markdown").markdown;
var htmlToText = require("html-to-text");
var Q = require("q");


module.exports = function() {
    this.listPages = listPages;
    this.getPageContent = getPageContent;
};


/**
 * @returns {promise}
 */
function getNotebookId() {
    var def = Q.defer();
    if (notebookGuid) {
        def.resolve(notebookGuid);
        return def.promise;
    }

    console.log("Fetching notebook ID for %s", notebookName);
    noteStore.listNotebooks(function (err, notebooks){
        if (err) { return console.error(err); }
        var found = notebooks.filter(function(item){
            return item.name.toLowerCase() === notebookName;
        });

        if (found && found.length === 1) {
            console.log("found notebook ID %s for %s", found[0].guid, notebookName);
            notebookGuid = found[0].guid;
            def.resolve(notebookGuid);
        } else {
            console.log("could not find notebook ID for %s", notebookName);
            notebookGuid = null;
        }
    });
    return def.promise;
}

/**
 * @access public
 * @callback cb - called with each note received
 */
function listPages(cb) {
    getNotebookId().then(go);

    function go() {
        console.log("getting notes for %s", notebookName);
        getNotes(notebookGuid, function(note) {
            cb({
                identifier: note.guid,
                title: note.title,
                slug: slug(note.title.toLowerCase()),
                createDate: moment.utc(note.created).toDate(),
                modifiedDate: moment.utc(note.updated).toDate(),
                tags: note.tags || [],
            });
        });
    }
}

/**
 * @param {Note} - a note to fetch content for
 * @returns {promise}
 */
function getPageContent(note) {
    var def = Q.defer();
    console.log("fetching note content for %s: '%s'", note.identifier, note.title);
    noteStore.getNote(note.identifier, true, true, true, true, function(err, found){
        var content;

        if (err) {
            console.error(err);
            def.reject(err);
        } else if (note.tags.indexOf("markdown") === -1) {
            content = enml.HTMLOfENML(found.content, found.resources);
            note.content = content.match(/<body[^>]+>(.+)<\/body>/)[1];
        } else {
            console.log("converting %s to markdown", note.slug);
            content = enml.HTMLOfENML(found.content, found.resources);
            var plain = htmlToText.fromString(content, { wordwrap: false });
            note.content = markdown.toHTML(plain, "Maruku");
        }
        console.log("note content for %s received", note.title);
        def.resolve(note);
    });
    return def.promise;
}



/**
 * getNotes
 *
 * @access private
 * @param {String} notebookId - notebook guid to lookup
 * @callback cb - called with each note received
 */
function getNotes(notebookId, cb) {
    var filter = new Evernote.NoteFilter();
    //set the notebook guid filter to the GUID of the default notebook
    filter.notebookGuid = notebookId;

    //create a new result spec for findNotesMetadata
    var resultSpec = new Evernote.NotesMetadataResultSpec();
    resultSpec.includeTitle = true;
    resultSpec.includeContentLength = true;
    resultSpec.includeCreated = true;
    resultSpec.includeUpdated = true;
    resultSpec.includeNotebookGuid = true;
    resultSpec.includeTagGuids = true;
    resultSpec.includeAttributes = true;

    //call findNotesMetadata on the note store
    noteStore.findNotesMetadata(filter, 0, 100, resultSpec, function(err, notesMeta) {
        if (err) { throw err; }
        else {
            //log the number of notes found in the default notebook
            console.log("Found %s notes", notesMeta.notes.length);
            notesMeta.notes.forEach(function(note) {
                getNoteTags(note).then(function(tags) {
                    note.tags = tags;
                    cb(note);
                });
            });
        }});
}

/**
 * getNoteTags
 *
 * @access private
 * @param {Note} note - A note to get tags for
 * @return {promise}
 */
function getNoteTags(note) {
    var def = Q.defer();
    console.log("Getting tags for %s", note.title);

    if (!note.tagGuids || note.tagGuids.length <= 0) {
        console.log("no tags for %s", note.title);
        def.resolve([]);
        return def.promise;
    }

    var all = note.tagGuids.map(function(tagGuid) {
        return getTag(tagGuid);
    });

    Q.allSettled(all).spread(function() {
        var tags = Array.prototype.slice.call(arguments).map(function(promise) {
            return promise.value;
        });
        console.log("TAGS for %s: %s", note.title, tags);
        def.resolve(tags);
    }).done();

    return def.promise;
}

function getTag(tagGuid) {
    var def = Q.defer();
    console.log("Getting tag for %s", tagGuid);
    noteStore.getTag(tagGuid, function(err, tag) {
        if (err) {
            console.error(err);
            def.reject(err);
        }
        def.resolve(tag.name);
    });
    return def.promise;
}
