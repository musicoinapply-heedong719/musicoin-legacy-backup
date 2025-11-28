const express = require('express');
const Router = express.Router();
const {
  licenseModule
} = require('../Kernel');

Router.get('/detail/v1/:address', licenseModule.getDetails.bind(licenseModule));
Router.get('/detail/:address', licenseModule.getDetails.bind(licenseModule));
Router.get('/getaudiourl/:address', licenseModule.getAudioUrlByAddress.bind(licenseModule));
Router.get('/newreleases', licenseModule.getNewReleases.bind(licenseModule));
Router.get('/top', licenseModule.getTopPlayed.bind(licenseModule));
Router.get('/random', licenseModule.getRandom.bind(licenseModule));
Router.get('/random/new', licenseModule.getRandomNew.bind(licenseModule));
Router.get('/details', licenseModule.getDetailsByAddresses.bind(licenseModule));
Router.get('/find', licenseModule.find.bind(licenseModule));
// Not in documentation
Router.get('/ppp/:address', licenseModule.getPppByAddress.bind(licenseModule));
Router.get('/ppp/v1/:address', licenseModule.getPppByAddressV1.bind(licenseModule));

Router.post('/distributeBalance/', licenseModule.distributeBalance.bind(licenseModule));
Router.post('/update', licenseModule.update.bind(licenseModule));
Router.post('/', licenseModule.getAll.bind(licenseModule));
Router.post('/release/v1', licenseModule.releaseLicenseV1.bind(licenseModule));

module.exports = Router;
