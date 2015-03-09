/* globals spyOn, describe, xdescribe, window, beforeEach, afterEach, it, expect */
(function () {
	describe('login controller', function () {
		beforeEach(module('app'));

		var capi, $q, $rootScope, $timeout, $scope, ctrl;

		beforeEach(function () {
			inject([
				"$rootScope", "$q", "$timeout", "capiService", "$controller",
				function (rootScope, q, timeout, capiService, $controller) {
					$rootScope = rootScope;
					$q = q;
					$timeout = timeout;
					capi = capiService;
					$scope = $rootScope.$new();
					ctrl = $controller('LoginController', {
						$scope: $scope,
						$state: jasmine.createSpyObj("$state", ["go"]),
						capiService: capi
					});
				}
			]);
		});

		afterEach(function() {
			//mockHttp.verifyNoOutstandingRequest();
			//mockHttp.verifyNoOutstandingExpectation();
		});

		xdescribe('login', function () {
			it('should login', function (done) {
				spyOn(capi, 'login')
					.and.returnValue($q.when({}));

				$scope.username = "user";
				$scope.password = "password";

				$scope.login()
					.then(complete, complete);

				function complete() {
					done();
				}
			});
		});

		xdescribe('logout', function () {
			it('should remove auth header upon success', function (done) {
				$http.defaults.headers.common.Authorization = "something";

				mockHttp.expectPOST('/capi/auth/logout')
					.respond(200, {});

				capi.logout()
					.then(complete, complete);

				mockHttp.flush();

				function complete() {
					expect($http.defaults.headers.common.Authorization).toBeUndefined();
					done();
				}
			});

			it('should reject unless 2xx status code', function (done) {
				$http.defaults.headers.common.Authorization = "something";

				mockHttp.expectPOST('/capi/auth/logout')
					.respond(400, {});

				capi.logout()
					.then(fail, pass);

				mockHttp.flush();

				/* CALLBACKS */
				function pass() {
					expect($http.defaults.headers.common.Authorization).not.toBeUndefined();
					done()
				}

				function fail() {
					throw new Error('Did not reject');
				}

			});
		});

	});

}).call(this);

