const mongoose = require('./../connections/core');

module.exports = mongoose.model('IPFSResource', mongoose.Schema({
    hash: String,
    dateAdded: {
        type: Date,
        default: Date.now,
        index: true
    }
}));

