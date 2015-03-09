/*
 *  This is a test file from another angular project I used in the past
 *  I keep it here for example code to use when I write my own e2e tests
 *  this file should not run in any tests because they are marked with "x"
 *  (e.g. xdescribe rather than describe) which jasmine excludes
 */
(function() {
	var utils = require("../utils");
	var ptor = protractor;
	var baseUrl = ptor.baseUrl;

	browser.driver.manage().window().setSize(800, 600);

	describe("routes", function() {
		it("should redirect to /#/login when hash is empty", function() {
			utils.navigate("/");
			ptor.getCurrentUrl().then(function(url) {
				var path = url.replace(baseUrl, "");
				expect(path).toBe("/#/login");
			});
		});

		it("should redirect to /#/login when hash is unknown", function() {
			utils.navigate("/#/asdf");
			ptor.getCurrentUrl().then(function(url) {
				var path = url.replace(baseUrl, "");
				expect(path).toBe("/#/login");
			});
		});

		xit("should load notes view with /notes path", function() {
			utils.navigate("/#/notes/all");
			var actual = element(by.css("[ng-view] .notes-list")).isPresent();
			expect(actual).toBe(true);
		});
	});

	xdescribe("notes", function() {
		it("should not show tags when a note isnt selected", function() {
			expect(element(by.id("new-tag")).isPresent()).toBe(false);
		});

		it("should create a new note", function() {
			utils.createNote();
			expect(element.all(by.css(".note-item")).count()).toBe(1);
		});

		it("should select a note when clicked", function() {
			var actual, note;
			note = element(by.css(".note-item"));
			note.click();
			actual = note.getAttribute("class").then(function(classes) {
				expect(classes.split(" ")).toContain("note-item-selected");
			});
		});

		it("should show tags when a note is selected", function() {
			var present = element(by.id("new-tag")).isPresent();
			expect(present).toBe(true);
		});

		it("should add a tag when enter is pressed", function() {
			var input = element(by.model("newTag"));
			input.sendKeys("newtag").then(function() {
				input.sendKeys(protractor.Key.ENTER).then(function() {
					var newtag = element.all(by.css(".tag input")).last();
					expect(newtag.getAttribute("value")).toBe("newtag");
				});
			});
		});

		it("should delete a tag", function() {
			var all = element.all(by.css(".tag"));
			all.count().then(function(origCount) {
				var expected = origCount - 1;
				all.last().findElement(by.css(".delete-tag")).click();
				all.count().then(function(actual) {
					expect(expected).toBe(actual);
				});
			});
		});

		it("should delete the selectedNote", function() {
			var notes = element.all(by.css(".note-item"));
			notes.count().then(function(origCount) {
				var expected = origCount - 1;
				utils.deleteNote(0);
				notes.count().then(function(actual) {
					expect(actual).toBe(expected);
				});
			});
		});
	});

	xdescribe("nav", function() {
		it("should navigate to the tag clicked", function() {
			utils.createNote({
				tag: "tag"
			});
			utils.syncNotes();
			var e = element.all(by.css(".user-nav-tag")).first();
			utils.screenShot();
			e.getText().then(function(text) {
				e.click();
				ptor.waitForAngular();
				ptor.getCurrentUrl().then(function(url) {
					var path = url.replace(baseUrl, "");
					expect(path).toBe("/#/notes/" + text);
					utils.deleteNote(0);
				});
			});
		});
	});

}).call(this);