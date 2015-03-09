(function(){ angular
    .module("app")
    .config(config);

function config ($httpProvider, $provide) {
    $provide.factory("AuthHttpInterceptor", AuthHttpInterceptor);
    $httpProvider.interceptors.push("AuthHttpInterceptor");
}
config.$inject = ["$httpProvider", "$provide"];

function AuthHttpInterceptor ($q, $rootScope) {

    return {
        request: function(conf){
            if (conf.url.indexOf("/api") === 0) {
                $rootScope.$broadcast("xhr-loading-started");
            }
            return conf;
        },
        response: function(response){
            $rootScope.$broadcast("xhr-loading-complete");
            return response;
        },
        responseError: function (rejection) {
            if (rejection.status === 403) {
                $rootScope.$broadcast("403");
            }
            $rootScope.$broadcast("xhr-loading-complete", rejection.status);
            return $q.reject(rejection);
        }
    };
}
AuthHttpInterceptor.$inject = ["$q", "$rootScope"];

 })();