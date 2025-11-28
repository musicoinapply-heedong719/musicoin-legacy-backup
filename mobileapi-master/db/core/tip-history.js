const mongoose = require('./../connections/core');

module.exports = mongoose.model('TipHistory', mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    release: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Release',
        index: true
    },
    tipCount: Number,
    date: Date
}));

