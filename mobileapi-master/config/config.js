const request = require('request');

const loadConfig = function(argsv) {
  const config = getDefaultKeyValueConfig()
  const cmdLineOverrides = convertArgsToKeyValuePairs(argsv);
  // Override defaults
  Object.assign(config, cmdLineOverrides);
  // computed values (N.B. make sure this is *after* defaults have been overridden)
  Object.assign(config, getComputedKeyValuePairs(config));
  // Allow computed values to be overridden directly from the command line
  Object.assign(config, cmdLineOverrides);
  return getStructuredConfig(config);
};

function getStructuredConfig(keyValuePairs) {
  return keyValuePairs;
}

function convertArgsToKeyValuePairs(argsv) {
  const config = {};
  argsv.forEach(function(val, index, array) {
    if (val.startsWith("--")) {
      config[val.substr(2)] = array[index + 1];
    }
  });
  return config;
}

function getComputedKeyValuePairs(config) {
  return {
    web3Url: config.web3Endpoint,
    ipfsReadUrl: config.ipfsReadEndpoint,
    ipfsAddUrl: `${config.ipfsAddEndpoint}/api/v0/add`,
    keyMainDatabaseUrl: `${config.mongoEndpoint}/musicoin-org`,
    keyCoreDatabaseUrl: `${config.mongoEndpoint}/key-store`,
    sessionSecretKey: config.sessionSecretKey
  };
}

function getDefaultKeyValueConfig() {
  const env = process.env;
  return {
    web3Endpoint: env.WEB3_ENDPOINT || 'http://localhost:8545',
    ipfsReadEndpoint: env.IPFS_READ_ENDPOINT || 'http://localhost:8080',
    ipfsAddEndpoint: env.IPFS_ADD_ENDPOINT || 'http://localhost:5001',
    mongoEndpoint: env.MONGO_ENDPOINT || "mongodb://localhost",
    port: env.MUSICOIN_API_PORT || 3000,
    publishingAccount: env.PUBLISHING_ACCOUNT || "0x6e1d33f195e7fadcc6da8ca9e36d6d4d717cf504",
    publishingAccountPassword: env.PUBLISHING_ACCOUNT_PASSWORD || "dummy",
    paymentAccount: env.PAYMENT_ACCOUNT || "0xfef55843244453abc7e183d13139a528bdfbcbed",
    paymentAccountPassword: env.PAYMENT_ACCOUNT_PASSWORD || "dummy",
    contractOwnerAccount: env.CONTRACT_OWNER_ACCOUNT || "0x6e1d33f195e7fadcc6da8ca9e36d6d4d717cf504",
    orbiterEndpoint: env.ORBITER_ENDPOINT || "https://explorer.musicoin.org",
    maxCoinsPerPlay: env.MAX_COINS_PER_PLAY || 1,
    rewardMax: env.REWARD_MAX || 250,
    rewardMin: env.REWARD_MIN || 50,
    sessionSecretKey: env.SESSION_SECRET_KEY || 'secret',
    contractVersion: env.CONTRACT_VERSION || "v0.3",
    forwardingAddress: env.FORWARDING_ADDRESS || '0x0',
    debug: env.DEBUG || 0,   // should be change to false by default
    itunesSharedSecret: env.ITUNES_SHARED_SECRET || '',
    googlePubKey: env.GOOGLE_PUB_KEY || ''
  };
}

module.exports.loadConfig = loadConfig;
