const mongoose = require('../connection');
module.exports = mongoose.model('newsletter', mongoose.Schema({
    subject: String,
    html: String,
    createAt: {
        type: Date,
        default: Date.now
    },
    addresses:[String],
    status: String,
    issues: [String]
}));