(function(){ angular
    .module("app")
    .filter("elip", elip);

elip.$inject = [];

function elip() {
    /**
     * @param {String} input
     * @param {Number} length
     */
    return function(input, length) {
        var raw = input
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            ;
        return raw.substr(0, length || 200);
    };
}
 })();