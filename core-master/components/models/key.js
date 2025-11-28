const mongoose = require('mongoose');

// define the schema for our user model
const keySchema = mongoose.Schema({
  tx: String,
  key: String,
  licenseAddress: String,
  failed: Boolean
});

// create the model for users and expose it to our app
module.exports = mongoose.model('LicenseKeys', keySchema);