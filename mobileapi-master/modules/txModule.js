const Promise = require('bluebird');
const Web3Reader = require('./blockchain/web3-reader');

function TransactionModule(web3Reader, licenseModule, artistModule) {
  this.web3Reader = web3Reader;
  this.licenseModule = licenseModule;
  this.artistModule = artistModule;
};

TransactionModule.prototype.getTransaction = function(hash) {
  return this.web3Reader.getTransaction(hash);
};

TransactionModule.prototype.getTransactionReceipt = function(hash) {
  return this.web3Reader.getTransactionReceipt(hash);
};

TransactionModule.prototype.getTransactionStatus = function(hash) {
  console.log(`Getting status of tx: "${hash}"`);
  return Promise.join(
    this.web3Reader.getTransaction(hash),
    this.web3Reader.getTransactionReceipt(hash),
    function(raw, receipt) {
      if (!raw) return {
        status: "unknown"
      };
      if (raw && !receipt) return {
        status: "pending"
      };
      if (raw.gas == receipt.gasUsed) return {
        status: "error"
      };
      return {
        status: "complete",
        receipt: receipt
      };
    });
};

TransactionModule.prototype.getTransactionDetails = function(hash) {
  const output = {
    transactionHash: hash
  };
  return this.web3Reader.getTransaction(hash)
    .bind(this)
    .then(function(transaction) {
      output.txType = this.web3Reader.getTransactionType(transaction);
      output.from = transaction.from;
      output.to = transaction.to;
      if (output.txType == Web3Reader.TxTypes.FUNCTION) {
        output.eventType = this.web3Reader.getFunctionType(transaction);

        // TODO: We can't tell what type of contract is being tipped easily.
        // If would require looking up the contract code from the address
        if (output.eventType == Web3Reader.FunctionTypes.PLAY)
          output.licenseAddress = transaction.to;
      } else if (output.txType == Web3Reader.TxTypes.CREATION) {
        output.contractMetadata = this.web3Reader.getContractType(transaction.input);
        if (output.contractMetadata) {
          if (output.contractMetadata.type == Web3Reader.ContractTypes.PPP) {
            output.eventType = "newrelease";
          } else if (output.contractMetadata.type == Web3Reader.ContractTypes.ARTIST) {
            output.eventType = "newartist";
          }
        }
        return this.web3Reader.getTransactionReceipt(hash);
      }
      return Promise.resolve(null);
    })
    .then(function(receipt) {
      if (receipt && receipt.contractAddress) {
        if (output.eventType == "newrelease") output.licenseAddress = receipt.contractAddress;
        if (output.eventType == "newartist") output.artistProfileAddress = receipt.contractAddress;
      }
      if (output.licenseAddress) {
        return this.web3Reader.loadContractAndFields(output.licenseAddress, this.web3Reader.pppV5.abi, ["title"], output)
      }
      return output;
    })
};

module.exports = TransactionModule;
