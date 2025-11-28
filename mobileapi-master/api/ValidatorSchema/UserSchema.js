const RenewMemeber = {
  publicKey: {
    type: "string",
    length: 42
  },
  txReceipt: {
    type: 'string',
    length: 66
  }
};

module.exports = {
  renew: RenewMemeber
};
