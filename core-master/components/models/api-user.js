const mongoose = require('mongoose');

// define the schema for our user model
const userSchema = mongoose.Schema({
  clientID: {
    type: String,
    unique: true,
    required: true
  },
  name: String,
  balance: {
    type: Number,
    min: 0,
    default: 0
  }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('APIUserAccount', userSchema);