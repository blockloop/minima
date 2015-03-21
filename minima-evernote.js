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
var notebookGuid = null;


module.exports = {
    listPages: listPages,
    getContent: getContent
};


noteStore.listNotebooks(function (err, notebooks){
    if (err) { return console.error(err); }
    var found = notebooks.filter(function(item){
        return item.name.toLowerCase() === "minima";
    });

    if (found && found.length === 1) {
        notebookGuid = found[0].guid;
    } else {
        notebookGuid = null;
    }
});

function listPages(cb) {
    getNotes(notebookGuid, function(notes) {
        notes.map(function(note) {
            return {
                id: note.guid,
                title: note.title,
                slug: slug(note.title.toLowerCase()),
                createDate: note.created,
                modifiedDate: note.updated,
                tags: note.tagGuids || [],
                resources: note.resources
            };
        }).forEach(cb);
    });
}

function getContent(note) {
    noteStore.getNote(note.guid, true, true, true, true, function(err, found){
        if (err) { return console.error(err); }
        /*eslint-disable */
        var html = enml.HTMLOfENML(found.content, found.resources);
        /*eslint-enable */
        console.log(html);
    });
}


function getNotes(notebookId, cb) {
    var filter = new Evernote.NoteFilter();
    //set the notebook guid filter to the GUID of the default notebook
    filter.notebookGuid = notebookId;


    //create a new result spec for findNotesMetadata
    var resultSpec = new Evernote.NotesMetadataResultSpec();
    //set the result spec to include titles
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
            cb(notesMeta.notes);
            // notesMeta.notes.forEach(function(note) {
            //     note.tagGuids.forEach(function(tagGuid) {
            //         noteStore.getTag(tagGuid);
            //     });
            // });
            // for (var i in notesMeta.notes) {
            //     //list the title of each note in the default notebook
            //     console.log("%s: %s", i, notesMeta.notes[i].title);
            // }
        }});
}
