const Promise = require('bluebird');
const Web3Reader = require('./blockchain/web3-reader');

function UserModule(web3Reader, licenseModule, artistModule) {
  this.web3Reader = web3Reader;
};

UserModule.prototype.getUserBalance = function(address) {
  return this.web3Reader.getBalanceInMusicoins(address);
};

module.exports = UserModule;
