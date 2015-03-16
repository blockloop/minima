angular
    .module("app")
    .config(config);

function config($stateProvider, $urlRouterProvider) {
    $stateProvider.state("home", {
        url: "/",
        templateUrl: "/home.html",
        controller: "HomeController as vm"
    });

    $stateProvider.state("post", {
        url: "/:slug",
        templateUrl: "/post.html",
        controller: "PostController as vm",
        resolve: {
            /*@ngInject*/
            post: function(Posts, $stateParams) {
                return Posts.getBySlug($stateParams.slug);
            }
        }
    });

    $stateProvider.state("admin", {
        url: "/admin",
        views: {
            "@": {
                templateUrl: "/admin.html",
                controller: "AdminController as vm"
            },
            "settings@admin": {
                templateUrl: "/settings.html",
                controller: "SettingsController as vm"
            },
            "login@admin": {
                templateUrl: "/login.html",
                controller: "LoginController as vm"
            }
        }
    });

    $urlRouterProvider.otherwise("/");
}


