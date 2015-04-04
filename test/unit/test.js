/*eslint no-unused-expressions: [0] */
/*eslint-env mocha */
'use strict';
var expect = require('expect.js');
var sinon = require('sinon');

(function () {
    var uuid = require('node-uuid');
    var Impl = require('minima-evernote-loader');
    var Chance = require('chance');
    var chance = new Chance();

    describe('article loader', function () {
        var instance = null;

        beforeEach(function () {
            instance = new Impl(mockLogger(), mockConfig());
        });

        afterEach(function() {
            instance = null;
        });

        describe('interface', function () {
            it('should export the right functions', function () {
                expect(instance.listPages).to.be.a('function');
                expect(instance.getPageContent).to.be.a('function');
            });

            it('should return promise for getPageContent', function() {
                expect(instance.getPageContent(mockNote()))
                    .to.have.property('done');
            });

        });

    });


    /*
     * UTILS
     */

    function mockNote() {
        return {
            identifier: uuid(),
            title: chance.string(),
            slug: chance.string(),
            createDate: Date.now(),
            modifiedDate: Date.now(),
            tags: []
        };
    }

    function mockLogger() {
        return {
            trace: sinon.stub(),
            info: sinon.stub(),
            debug: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub(),
            fatal: sinon.stub()
        };
    }

    function mockConfig() {
        return sinon.stub();
    }

})();
