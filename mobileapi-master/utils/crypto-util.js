const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

/**
 * generate random token
 * @param {*} count token lenght
 */
function generateToken(count) {
  return crypto.randomBytes(count).toString('hex');
}

/**
 * hash the password before save to db
 * @param {*} password 
 */
function hashPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

/**
 * 
 * @param {*} hash the hash password that save in db
 * @param {*} password user input password
 */
function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function md5(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}

module.exports = {
  md5,
  generateToken,
  hashPassword,
  comparePassword
}

