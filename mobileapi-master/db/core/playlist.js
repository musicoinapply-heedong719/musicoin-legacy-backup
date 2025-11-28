const mongoose = require('./../connections/core');

module.exports = mongoose.model('playlist', mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String
  },
  release: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Release'
  }
}));
