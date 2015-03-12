angular
    .module("app.services")
    .service("Posts", Posts);

Posts.$inject = ["baseService"];

function Posts(baseService) {
    this.get = get;
    this.getBySlug = getBySlug;

    function get(id) {
        return baseService.get("posts", {id: id});
    }

    function getBySlug(slug) {
        return baseService.get("posts/" + slug);
    }
}
