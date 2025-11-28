const mongoose = require('./../connections/core');

module.exports = mongoose.model('ApiPackage', mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    limitApiCalls: {
        type: Number,
        default: 1000
    }
}));