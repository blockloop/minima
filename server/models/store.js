var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('node-uuid');

var StoreSchema = new Schema({
    identifier: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    modifiedDate: {
        type: Date,
        default: Date.now
    },
    pairs: [{
        key: String,
        value: Object
    }]
});

StoreSchema.static('findByIdentifier', function (identifier, callback) {
    return this.find({ identifier: identifier }, callback);
});

module.exports = mongoose.model('Store', StoreSchema);
