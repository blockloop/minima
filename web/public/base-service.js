(function(){ angular
    .module("app")
    .service("baseService", baseService);

function baseService($http, $q) {
    var rootPath = "/api/";
    this.get = function (action, data) {
        return call("get", action, {params: data});
    };

    this.post = function (action, data) {
        return call("post", action, data);
    };

    this.put = function (action, data) {
        return call("put", action, data);
    };
    this.delete = function (action, data) {
        return call("delete", action, {params: data});
    };

    var call = function (verb, action, data) {
        var defer = $q.defer();
        $http[verb](rootPath + action, data)
            .then(onSuccess, onError);

        function onSuccess(response) {
            if (response.status > 299 || response.status < 200) {
                defer.reject(response);
            }
            var result;
            if (response && response.data && typeof response.data.result === "string") {
                result = JSON.parse(response.data.result);
            }
            else {
                result = response.data;
            }
            defer.resolve(result);
        }

        function onError(error) {
            defer.reject(error);
        }

        return defer.promise;
    };

}
baseService.$inject = ["$http", "$q"];
 })();