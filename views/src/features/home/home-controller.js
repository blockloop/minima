angular
    .module("app")
    .controller("HomeController", HomeController);

HomeController.$inject = ["postService"];

function HomeController(Posts) {
    var vm = this;
    vm.posts = [];

    activate();

    ///////////

    function activate() {
        Posts.get().then(function(posts){
            vm.posts = posts;
        });
    }
}
