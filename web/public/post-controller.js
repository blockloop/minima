(function(){ angular
    .module("app")
    .controller("PostController", PostController);

function PostController(post) {
    var vm = this;
    vm.post = post;
}
PostController.$inject = ["post"];
 })();