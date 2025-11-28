const express = require('express');
const Router = express.Router();
const {
  txModule
} = require('../Kernel');

Router.get('/detail/:hash', txModule.getTxDetails.bind(txModule));
Router.get('/raw/:hash', txModule.getTx.bind(txModule));
Router.get('/receipt/:hash', txModule.getTxReceipt.bind(txModule));
Router.get('/status/:hash', txModule.getTxStatus.bind(txModule));
Router.get('/history/:address', txModule.getTxHistory.bind(txModule));

module.exports = Router;
