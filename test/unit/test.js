/*eslint-env jasmine, mocha */
var uuid = require("node-uuid");
var Impl = require("../../minima-evernote.js");
var Chance = require("chance");
var chance = new Chance();

(function () {
    describe("article loader", function () {
        var instance = null;

        beforeEach(function () {
            instance = new Impl();
        });

        afterEach(function() {
            instance = null;
        });

        describe("interface", function () {
            it("should export the right functions", function () {
                expect(instance.listPages).toBeDefined();
                expect(instance.getPageContent).toBeDefined();
            });

            it("should return promise getPageContent", function() {
                expect(instance.getPageContent(mockNote()).then)
                    .toBeDefined();
            });

        });

    });

})();

function mockNote() {
    return {
        identifier: uuid(),
        title: chance.string(),
        slug: chance.string(),
        createDate: Date.now(),
        modifiedDate: Date.now(),
        tags: [],
    };
}
