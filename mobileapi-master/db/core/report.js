const mongoose = require("../connections/core");

module.exports = mongoose.model("report", mongoose.Schema({
  reportEmail: {
    type: String
  },
  reportType: {
    type: String
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String
  },
  release: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Release'
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}));