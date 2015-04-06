var Store = require('./models/store');
var util = require('util');

module.exports = function(parent){
    var store;

    console.log('searching for stores for %s...', parent);
    Store.findByIdentifier(parent).exec(function(err, stores) {
        if (err) {
            throw new Error(err);
        } else if (!stores.length) {
            console.log('no storage for %s. creating', parent);
            console.log('stores: %s', util.inspect(stores));
            store = new Store({
                identifier: parent,
                modifiedDate: Date.now(),
                pairs: []
            });
            store.markModified('modifiedDate');
            store.save(function(err2) {
                if (err) {
                    console.error('ERROR saving: %s', util.inspect(err2));
                } else {
                    console.log('saved!');
                }
            });
        } else {
            console.log('found storage for %s', parent);
            store = stores[0];
        }
    });


    this.get = function(key) {
        if (!store) {
            return null;
        }
        var found = store.pairs.filter(function(item) {
            return item.key === key;
        });
        if (found && found.length) {
            return found[0].value;
        }
    };

    this.set = function(key, value) {
        store.pairs.push({
            key: key,
            value: value
        });
        store.markModified('modifiedDate');
        store.save();
    };

    this.remove = function(key) {
        var found = null;

        for (var i = 0; i < store.pairs.length; i++) {
            if (store.pairs[i].key === key) {
                found = i;
                break;
            }
        }

        if (found != null) {
            store.pairs.splice(found, 1);
            store.markModified('modifiedDate');
            store.save();
        }
    };

};
