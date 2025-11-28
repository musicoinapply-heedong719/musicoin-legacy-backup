const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_SERVER);
module.exports = mongoose