(function(){ angular
    .module("app.services")
    .service("Posts", Posts);

Posts.$inject = ["baseService"];

function Posts(baseService) {
    this.get = get;

    function get(id) {
        return baseService.get("posts", {id: id});
    }
}
 })();