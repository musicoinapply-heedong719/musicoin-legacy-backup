const ComponentRegistry = require("./components/config/component-registry");
const Web3Writer = require("./components/blockchain/web3-writer.js");

function MusicoinCore(configOrProvider) {
  this.provider = configOrProvider.isRegistry
    ? configOrProvider
    : new ComponentRegistry(configOrProvider);
}

MusicoinCore.prototype.getArtistModule = function() { return this.provider.getArtistModule()};
MusicoinCore.prototype.getLicenseModule = function() {return this.provider.getLicenseModule()};
MusicoinCore.prototype.getTxModule = function() { return this.provider.getTxModule()};
MusicoinCore.prototype.getMediaProvider = function() { return this.provider.getMediaProvider()};
MusicoinCore.prototype.getWeb3Reader = function() { return this.provider.getWeb3Reader()};
MusicoinCore.prototype.getWeb3Writer = function() { return this.provider.getWeb3Writer()};

MusicoinCore.prototype.getArtist = function(address) {
  return this.getArtistModule().getArtistByProfile(address);
};

MusicoinCore.prototype.getLicense = function(address) {
  return this.getLicenseModule().getLicense(address);
};

MusicoinCore.prototype.getTransactionDetails = function(hash) {
  return this.getTxModule().getTransactionDetails(hash);
};

/**
 * Sends a tip to PPP contract located at the given address for the given amount
 *
 * @licenseAddress: The contract address
 * @amountInWei: The amount to be sent, in units of wei
 * @credentialProvider: (optional) a object that implements the getCredentials() method, returning a
 *                      Promise that resolves to JSON object:
 *      {
 *        account: <account address>,
 *        password: <account password>
 *      }
 *      the credentials provider can be omitted if the default provider has been set by a call to
 *      MusicoinCore#setCredentials or MusicoinCore#setCredentialsProvider.
 */
MusicoinCore.prototype.sendTip = function(licenseAddress, amountInWei, credentialProvider) {
  return this.getWeb3Writer().tipLicense(licenseAddress, amountInWei, credentialProvider);
};

/**
 * Sends a payment to the PPP contract located at the given address.
 *
 * NOTE: The amount sent is equal to the price defined by the contract, so be careful.
 *
 * @licenseAddress: The contract address
 * @credentialProvider: (optional) a object that implements the getCredentials() method, returning a
 *                      Promise that resolves to JSON object:
 *      {
 *        account: <account address>,
 *        password: <account password>
 *      }
 *      the credentials provider can be omitted if the default provider has been set by a call to
 *      MusicoinCore#setCredentials or MusicoinCore#setCredentialsProvider.
 */
MusicoinCore.prototype.sendPPP = function(licenseAddress, credentialProvider) {
  return this.getWeb3Writer().ppp(licenseAddress, credentialProvider);
};

/**
 * Sets the default credential provider
 *
 * @credentialProvider: (optional) a object that implements the getCredentials() method, returning a
 *                      Promise that resolves to JSON object:
 *      {
 *        account: <account address>,
 *        password: <account password>
 *      }
 */
MusicoinCore.prototype.setCredentialsProvider = function(provider) {
  this.getWeb3Writer().setCredentialsProvider(provider);
};

/**
 * Sets the default credentials to be used
 *
 * @account: The account address
 * @pwd: The password to unlock the account
 */
MusicoinCore.prototype.setCredentials = function(account, pwd) {
  this.getWeb3Writer().setCredentialsProvider(Web3Writer.createInMemoryCredentialsProvider(account, pwd));
};

/**
 * Creates a new account
 * @param pwd The password for the account
 * @returns {Promise<string>} A promise that will resolve to the new account number
 */
MusicoinCore.prototype.createAccount = function(pwd) {
  return this.getWeb3Writer().createAccount(pwd);
};

/**
 *
 * @param releaseRequest: A JSON object with the following properties
 * {
 *    title: "My Song Title",
 *    profileAddress: <address of the Artist profile contract>,
 *    coinsPerPlay: The number of Musicoins to charge for each stream (e.g. 1)
 *    audioResource: A stream or a path to a local audio file
 *    imageResource: A stream or a path to a local image file
 *    metadata: A JSON Array with key value pairs (duplicate keys are ok): [{"key": "myKey", "value": "someValue"}, ...]
 *    royalties: A JSON Array of the fixed amount royalty payments to be paid for each play, where each item has an address and an
 *       amount defined Musicoin, e.g. [{address: 0x111111, amount: 0.5}, {address: 0x222222, amount: 0.1}]
 *    contributors: A JSON array of the proportional amount to be paid for each play and tip, where each item
 *       has an address and an integer number of shares, e.g. [{address: 0x111111, shares: 5}, {address: 0x222222, shares: 3}].
 * }
 * @param credentialsProvider:
 */
MusicoinCore.prototype.releaseLicense = function(releaseRequest, credentialsProvider) {
  return this.getLicenseModule().releaseLicense(releaseRequest, credentialsProvider);
};

MusicoinCore.prototype.releaseArtistProfile = function(releaseRequest, credentialsProvider) {
  return this.getArtistModule().releaseProfile(releaseRequest, credentialsProvider);
};

module.exports = MusicoinCore;
