const mongoose = require('../connections/core');

module.exports = mongoose.model('Receipt', mongoose.Schema({
  receiptkey: String,
  email: String,
  coins: Number,
  type: String,
  stat: Number,
  prod: Boolean,
  create_at: Date
}));
