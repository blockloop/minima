var StoreDb = require('./models/store');
var util = require('util');
var Q = require('q');
var log = require('./logger');

module.exports = function(parent){
    var def = Q.defer();

    log.trace('searching for stores for %s...', parent);
    StoreDb.findByIdentifier(parent).exec(function(err, stores) {
        if (err) {
            throw new Error(err);
        } else if (!stores.length) {
            log.trace('no storage for %s. creating', parent);
            log.trace('stores: %s', util.inspect(stores));
            var storeDb = new StoreDb({
                identifier: parent,
                modifiedDate: Date.now(),
                pairs: []
            });
            storeDb.markModified('modifiedDate');
            storeDb.save(function(err2) {
                if (err) {
                    console.error('ERROR saving: %s', util.inspect(err2));
                } else {
                    log.trace('saved!');
                    def.resolve(new Store(storeDb));
                }
            });
        } else {
            log.trace('found storage for %s', parent);
            def.resolve(new Store(stores[0]));
        }
    });

    return def.promise;


};


function Store(db_) {
    var db = db_;

    this.get = function(key) {
        var found = db.pairs.filter(function(item) {
            return item.key === key;
        });
        if (found && found.length) {
            return found[0].value;
        }
    };

    this.set = function(key, value) {
        db.pairs.push({
            key: key,
            value: value
        });
        db.markModified('modifiedDate');
        db.save();
    };

    this.remove = function(key) {
        var found = null;

        for (var i = 0; i < db.pairs.length; i++) {
            if (db.pairs[i].key === key) {
                found = i;
                break;
            }
        }

        if (found != null) {
            db.pairs.splice(found, 1);
            db.markModified('modifiedDate');
            db.save();
        }
    };

}
