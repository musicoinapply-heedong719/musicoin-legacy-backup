const mongoose = require('../connections/core');

module.exports = mongoose.model('Like', mongoose.Schema({
  liker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  liking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Release',
    index: true
  },
  startDate: {
    type: Date,
    default: Date.now
  }
}));
