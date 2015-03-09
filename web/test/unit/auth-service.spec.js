/*global inject */
/*eslint-env jasmine, mocha */

/*eslint-disable */ function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}/*eslint-enable */

(function () {
    describe("auth service", function () {
        var service, $httpBackend, $http, ipCookie, $rootScope;

        beforeEach(module("app"));

        beforeEach(function () {
            fn.$inject = ["authService", "$httpBackend", "$http", "ipCookie", "$rootScope"];
            function fn(authService_, $httpBackend_, $http_, ipCookie_, $rootScope_) {
                service = authService_;
                $httpBackend = $httpBackend_;
                $http = $http_;
                ipCookie = ipCookie_;
                $rootScope = $rootScope_;
            }
            inject(fn);
        });

        beforeEach(function() {
            $httpBackend.when("GET", "views/login.html").respond("");
        });

        beforeAll(function(){
            deleteAllCookies();
        });

        afterEach(function() {
            try { $httpBackend.flush(); }
            catch (e) {}
            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();
        });

        function deleteAllCookies() {
            var cookies = document.cookie.split(";");

            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                var eqPos = cookie.indexOf("=");
                var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }
        }

        function flushHttpRequests(){
            if(!$rootScope.$$phase) {
                $rootScope.$apply();
            }
            $httpBackend.flush();
        }

        describe("login", function () {
            it("should return a promise", function () {
                // arrange
                $httpBackend.expectPOST(new RegExp("/api/auth"))
                    .respond(200);
                // act
                var promise = service.login();
                // assert
                expect(promise.then).toBeDefined();
                expect(promise.catch).toBeDefined();
            });

            it("should reject if login fails", function (){
                $httpBackend.expectPOST(new RegExp("/api/auth"))
                    .respond(400, {});

                var errorSpy = jasmine.createSpy("errorSpy");
                var successSpy = jasmine.createSpy("successSpy");

                service.login("user", "pw")
                    .then(successSpy, errorSpy);

                flushHttpRequests();

                expect(errorSpy).toHaveBeenCalled();
                expect(successSpy).not.toHaveBeenCalled();
            });

            describe("client variables", function () {
                var mockToken = uuid();
                var mockUsername = "username";
                var mockResponse = {
                    token: mockToken,
                    isAuthenticated: true,
                    userInformation: {
                        agentIdentifier: uuid()
                    }
                };

                beforeAll(function(done){
                    $httpBackend.expectPOST(new RegExp("/api/auth"))
                        .respond(200, mockResponse);

                    service.login(mockUsername, "pw")
                        .then(done, done);

                    flushHttpRequests();
                });

                it("should set http auth headers", function(){
                    expect($http.defaults.headers.common.Authorization).toBe("Token " + mockToken);
                });

                it("should set agent cookie", function(){
                    expect(ipCookie("agent")).toBe(mockUsername);
                });

                it("should set agentIdentifier cookie", function(){
                    expect(ipCookie("agentIdentifier")).toBe(mockResponse.userInformation.agentIdentifier);
                });
            });

        });

        describe("logout", function () {
            describe("client variables", function () {
                beforeAll(function(done){
                    $httpBackend.expectDELETE(new RegExp("/api/auth"))
                        .respond(200);

                    service.logout()
                        .then(done, done);

                    flushHttpRequests();
                });

                it("should unset http auth headers", function(){
                    expect($http.defaults.headers.common.Authorization).toBeUndefined();
                });

                it("should unset agent cookie", function(){
                    expect(ipCookie("agent")).toBeUndefined();
                });

                it("should unset agentIdentifier cookie", function(){
                    expect(ipCookie("agentIdentifier")).toBeUndefined();
                });

                it("should unset auth cookie", function(){
                    expect(ipCookie("auth")).toBeUndefined();
                });
            });

        });

    });

})();
