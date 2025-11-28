const mongoose = require('./../connections/core');

module.exports = mongoose.model('APIUserAccount', mongoose.Schema({
  email: {
    type: Object,
    unique: true,
  },
  clientSecret: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
  },
  timeout: {
    type: Number,
  },
  limitApiCalls: {
    type: Number,
    default: 1000
  },
  calls: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    min: 0,
    default: 0
  },
  tier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiPackage'
  }
}));
