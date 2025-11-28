const express = require('express');
const JsonPromiseRouter = require('./json-promise-router');
const router = express.Router();
const jsonRouter = new JsonPromiseRouter(router, "artist");
const jsonParser = require('body-parser').json();
const LicenseKey = require('../components/models/key');
let artistModule;
let publishCredentialsProvider;
let hotWalletCredentialsProvider;

const defaultRecords = 20;
const maxRecords = 100;
function getLimit(req) {
    return Math.max(0, Math.min(req.query.limit || defaultRecords, maxRecords));
}

jsonRouter.get('/profile/:address', req => artistModule.getArtistByProfile(req.params.address));
jsonRouter.get('/new/', req => artistModule.getNewArtists(getLimit(req)));
jsonRouter.get('/featured/', req => artistModule.getFeaturedArtists(getLimit(req)));
jsonRouter.get('/find/', req => artistModule.findArtists(getLimit(req), req.query.term));

jsonRouter.post('/profile/', jsonParser, function(req, res, next) {
  return publishCredentialsProvider.getCredentials()
    .then(function(credentials) {
      const releaseRequest = {
        profileAddress: req.body.profileAddress,
        owner: credentials.account,
        artistName: req.body.artistName,
        imageUrl: req.body.imageUrl,
        socialUrl: req.body.socialUrl,
        descriptionUrl: req.body.descriptionUrl
      };
      console.log("Got profile POST request: " + JSON.stringify(releaseRequest));
      return artistModule.releaseProfile(releaseRequest)
    })
    .then(function(tx) {
      return {tx: tx};
    });
});

jsonRouter.post('/send/', jsonParser, function(req, res, next) {
  return artistModule.sendFromProfile(req.body.profileAddress, req.body.recipientAddress, req.body.musicoins)
    .then(function(tx) {
      return {tx: tx};
    });
});

jsonRouter.post('/ppp/', jsonParser, function(req, res, next) {
  const context = {};
  return LicenseKey.findOne({licenseAddress: req.body.licenseAddress}).exec()
    .then(record => {
      if (!record) throw new Error("Key not found for license: " + req.body.licenseAddress);
      context.key = record.key;
      return artistModule.pppFromProfile(req.body.profileAddress, req.body.licenseAddress, hotWalletCredentialsProvider)
    })
    .then(transactions => {
      context.transactions = transactions;
      return context;
    })
});


module.exports.init = function(_artistModule, _publishCredentialsProvider, _hotWalletCredentialsProvider) {
  artistModule = _artistModule;
  publishCredentialsProvider = _publishCredentialsProvider;
  hotWalletCredentialsProvider = _hotWalletCredentialsProvider;
  return router;
};
