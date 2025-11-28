const express = require('express');
const request = require('request');
const JsonPromiseRouter = require('./json-promise-router');
const expressRouter = express.Router();
const router = new JsonPromiseRouter(expressRouter, "tx");
let txModule;
let orbiterEndpoint;

router.get('/detail/:hash', req => txModule.getTransactionDetails(req.params.hash));
router.get('/raw/:hash', req => txModule.getTransaction(req.params.hash));
router.get('/receipt/:hash', req => txModule.getTransactionReceipt(req.params.hash));
router.get('/status/:hash', req => txModule.getTransactionStatus(req.params.hash));
router.get('/history/:address', req => {
  return getJson(orbiterEndpoint, {
    addr: req.params.address,
    length: typeof req.query.length != "undefined" ? req.query.length : 10,
    start: req.query.start
  })
    .then(results => {
      return results.data
        .filter(tx => tx[4] > 0)
        .map(tx => {
          return txModule.getTransactionDetails(tx[0])
            .then(function (details) {
              return {
                transactionHash: tx[0],
                blockNumber: tx[1],
                from: tx[2],
                to: tx[3],
                musicoins: tx[3] == req.params.address ? tx[4] : -tx[4],
                timestamp: tx[6],
                eventType: details.eventType || "transfer",
                txType: details.txType,
                title: details.title || details.artistName,
                licenseAddress: details.licenseAddress
              }
            });
        })
    })
    .then(function (promises) {
      return Promise.all(promises);
    })
});

function getJson(url, properties) {
  return new Promise(function(resolve, reject) {
    request({
      method: 'post',
      url: url,
      body: properties,
      json: true,
    }, function(error, response, result) {
      if (error) {
        console.log(`Request failed with ${error}, url: ${url}, properties: ${JSON.stringify(properties)}`);
        return reject(error);
      }
      resolve(result)
    })
  }.bind(this));
}

module.exports.init = function(_txModule, _orbiterEndpoint) {
  txModule = _txModule;
  orbiterEndpoint = _orbiterEndpoint;
  return expressRouter;
};
