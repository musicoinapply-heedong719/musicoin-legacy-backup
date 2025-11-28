var assert = require('assert');
const Promise = require('bluebird');
const Web3Writer = require('../components/blockchain/web3-writer');

describe('Web3Writer', function() {
  const sender = "0x00000";
  const code = "0x123456"
  const contractAddress = "0x99999";
  const transactionHash = "txHash";
  const constructorArgs = ["x", "z", "y"];
  const expectedAbi = {};
  const releaseRequest = { x: "1", y: "2", z: "3"};

  const creds = {account: sender, password: "pwd"};
  const credsProvider = { getCredentials: () => Promise.resolve(creds)};

  const gas = 12345;
  it ('should release a profile', function(){
    const mockEth = {
      contract: (abi) => {
        assert.strictEqual(abi, expectedAbi);
        const builder = {};

        builder['new'] = function() {
          // make sure the arguments that are passed to the "new" function are what we expect
          assert.equal(arguments[0], releaseRequest[constructorArgs[0]]);
          assert.equal(arguments[1], releaseRequest[constructorArgs[1]]);
          assert.equal(arguments[2], releaseRequest[constructorArgs[2]]);
          assert.equal(arguments[3].from, sender);
          assert.equal(arguments[3].gas, gas);
          assert.equal(arguments[3].data, code);

          const listener = arguments[4];
          listener(null, {transactionHash: transactionHash});
          listener(null, {address: "0x99999"});
        };
        return builder;
      }
    };
    const web3 = {
      eth: mockEth,
      personal: {
        unlockAccount: (account, pwd, time, callback) => {
          assert.equal(account, sender);
          assert.equal(pwd, "pwd");
          callback(null, account)
        }
      }
    };
    const web3Reader = {
      getWeb3: () => web3,
      getContractDefinition: (type, version) => {
        return {
          abi: expectedAbi,
          constructorArgs: constructorArgs,
          code: code,
          deploymentGas: gas,
          type: type,
          version: version
        }
      }
    };
    const web3Writer = new Web3Writer(web3Reader);

    return web3Writer.releaseArtistProfile(releaseRequest, credsProvider)
      .then(function(tx) {
        assert.equal(tx, transactionHash);
      });
  })
});