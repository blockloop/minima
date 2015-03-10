(function(){ angular
    .module("app")
    .config(config);

function config($stateProvider, $urlRouterProvider) {
    $stateProvider.state("login", {
        url: "/login",
        templateUrl: "/login.html",
        controller: "LoginController as vm"
    });

    $stateProvider.state("home", {
        url: "/",
        templateUrl: "/home.html",
        controller: "HomeController as vm"
    });

    $stateProvider.state("admin", {
        url: "/admin",
        views: {
            "@": {
                templateUrl: "/admin.html",
                controller: "AdminController as vm"
            },
            "settings@call": {
                templateUrl: "/settings.html",
                controller: "SettingsController as vm"
            },
        }
    });

    $urlRouterProvider.otherwise("/");
}
config.$inject = ["$stateProvider", "$urlRouterProvider"];


 })();