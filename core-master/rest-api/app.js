const express = require('express');
const app = express();
const ConfigUtils = require('../components/config/config-utils');
const Web3Writer = require('../components/blockchain/web3-writer');
const Timers = require('timers');
const jsonParser = require('body-parser').json();
const mongoose = require('mongoose');
const MusicoinCore = require("../mc-core");
const rp = require('request-promise-native');
var rewardP = 0;

ConfigUtils.loadConfig(process.argv)
  .then(config => {
    loadApp(config);
  });

function loadApp(config) {
  const musicoinCore = new MusicoinCore(config);
  const contractOwnerAccount = config.contractOwnerAccount;
  const publishCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.publishingAccount, config.publishingAccountPassword);
  const paymentAccountCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.paymentAccount, config.paymentAccountPassword);

  const AccountManager = require("../components/account-manager");
  const accountManager = new AccountManager();
  const licenseModule = require("./license").init(musicoinCore.getLicenseModule(), accountManager, publishCredentialsProvider, paymentAccountCredentialsProvider, contractOwnerAccount);
  const artistModule = require("./artist").init(musicoinCore.getArtistModule(), publishCredentialsProvider, paymentAccountCredentialsProvider);
  const txModule = require("./tx").init(musicoinCore.getTxModule(), config.orbiterEndpoint);
  const rewardMax = config.rewardMax;
  const rewardMin = config.rewardMin;

  musicoinCore.setCredentials(config.publishingAccount, config.publishingAccountPassword);
  mongoose.connect(config.keyDatabaseUrl);
  getMarketValue();

  const LicenseKey = require('../components/models/key');

  const get_ip = require('ipware')().get_ip;
  app.use(function (req, res, next) {
    get_ip(req);
    next();
  });

  app.use('/health/deep', function (req, res) {
    console.log("Received deep health check call...");
    return musicoinCore.getWeb3Reader().getBalanceInMusicoins("0x13559ecbdbf8c32d6a86c5a277fd1efbc8409b5b")
      .then(function (result) {
        res.json({ ok: true })
      })
      .then(function () {
        console.log("Health check ok");
      })
      .catch(function (err) {
        console.log("Health check failed: " + err);
        res.status(500);
        res.send("Health check failed");
      })
  });

  app.post('/client', jsonParser, function (req, res) {
    if (req.ip.indexOf('127.0.0.1') !== -1 && req.body) {
      accountManager.createAccount(req.body.clientId, req.body.name)
        .then((user) => res.json(user), (error) => res.status(500).json(error));
    }
    else {
      res.status(500).json({ error: 'Unknown error' });
    }
  });

  app.use("/", isKnownUser);

  app.use("/license", licenseModule);
  app.use('/artist', artistModule);
  app.use("/tx", txModule);
  app.use("/balance/:address", function (req, res) {
    musicoinCore.getWeb3Reader().getBalanceInMusicoins(req.params.address)
      .then(function (output) {
        res.json({
          musicoins: output
        });
      })
      .catch(function (err) {
        console.log(`Request failed in /balance/:address: ${err}`);
        res.status(500);
        res.send(err);
      });
  });

  app.use("/client/balance", function (req, res) {
    accountManager.getBalance(req.user.clientID)
      .then(function (output) {
        output.musicoins = musicoinCore.getWeb3Reader().convertWeiToMusicoins(output.balance);
        res.json(output);
      })
      .catch(function (err) {
        console.log(`Request failed in ${name}: ${err}`);
        res.status(500);
        res.send(err);
      });
  });

  app.post("/rewardmax", jsonParser, (req, res) => {
    musicoinCore.getWeb3Writer().sendCoins(req.body.recipient, rewardMax, paymentAccountCredentialsProvider)
      .then(tx => {
        res.json({ tx: tx });
      })
      .catch(function (err) {
        console.log(`Reward request failed: ${err}`);
        res.status(500);
        res.send(err);
      });
  });

  app.post("/rewardmin", jsonParser, (req, res) => {
    musicoinCore.getWeb3Writer().sendCoins(req.body.recipient, rewardMin, paymentAccountCredentialsProvider)
      .then(tx => {
        res.json({ tx: tx });
      })
      .catch(function (err) {
        console.log(`Reward request failed: ${err}`);
        res.status(500);
        res.send(err);
      });
  });

  app.post("/rewardppp", jsonParser, (req, res) => {
    if (rewardP == null) {
      console.log(`PPP Extra Reward request failed: PPP Extra Reward is undefined`);
      res.status(500);
    } else if (rewardP <= 0) {
      //console.log(`PPP Extra Reward request failed: Price is more than 0.01`);
      res.status(500);
    } else {
      musicoinCore.getWeb3Writer().sendCoins(req.body.recipient, rewardP, paymentAccountCredentialsProvider)
        .then(tx => {
          res.json({ tx: tx });
        })
        .catch(function (err) {
          console.log(`PPP Extra Reward request failed: ${err}`);
          res.status(500);
          res.send(err);
        });
    }
  });

  app.get("/sample/:address", isMashape, function (req, res) {
    res.json({ address: req.params.address, key: req.headers });
  });

  function getMarketValue() {
    var CoinMarketCapUrl = "https://api.coinmarketcap.com/v1/ticker/musicoin/?limit=1";
    rp({
      url: CoinMarketCapUrl,
      json: true
    })
      .then(result => JSON.parse(JSON.stringify(result)))
      .then(usd => rewardP = (0.011 / usd[0].price_usd) - 1)
      .catch(error => rewardP = this.maxCoinsPerPlayVar);
  }

  function isKnownUser(req, res, next) {
    if (config.isDev) {
      req.user = { clientID: "clientID" };
      return next();
    }
    let clientID = req.headers["clientid"];
    if (clientID) {
      accountManager.validateClient(clientID)
        .then(function () {
          req.user = { clientID: clientID };
          next();
        })
        .catch(function (err) {
          console.warn(err);
          console.warn((`Invalid clientid provided.  
          req.originalUrl: ${req.originalUrl}, 
          req.headers: ${JSON.stringify(req.rawHeaders)},
          req.clientIp: ${req.clientIp}
        `));
          res.status(401).send({ error: 'Invalid clientid: ' + clientID });
        });
    }
    else {
      console.warn((`No clientID provided.  
      req.originalUrl: ${req.originalUrl}, 
      req.headers: ${JSON.stringify(req.rawHeaders)},
      req.clientIp: ${req.clientIp}
    `));
      res.status(401).send({ error: 'Invalid user credentials, you must include a clientid header' });
    }
  }



  function isMashape(req, res, next) {
    // allow all requests when running in dev mode
    if (config.isDev) return next();

    const secret = req.headers['x-mashape-proxy-secret'] || req.headers['X-Mashape-Proxy-Secret'];
    if (secret == config.mashapeSecret) {
      next();
      return;
    }
    res.status(401).send({ error: 'Expected request from Mashape proxy' });
  }

  app.listen(config.port, function () {
    console.log('Listening on port ' + config.port);
    console.log(JSON.stringify(config, null, 2));
  });

  Timers.setInterval(tryUpdatePendingReleases, 2 * 60 * 1000);
  Timers.setInterval(getMarketValue, 10 * 60 * 1000);
  function tryUpdatePendingReleases() {
    console.log("Checking for pending releases...");
    LicenseKey.find({ licenseAddress: null, failed: { "$ne": true } }).exec()
      .then(function (records) {
        console.log(`Found ${records.length} records to check`);
        records.forEach(r => {
          console.log("Checking tx: " + r.tx);
          musicoinCore.getTxModule().getTransactionStatus(r.tx)
            .then(function (result) {
              if (result.status == "complete" && result.receipt && result.receipt.contractAddress) {
                r.licenseAddress = result.receipt.contractAddress;
                r.save(function (err) {
                  if (err) return console.log("Failed to save key record");
                  console.log("Updated key record: " + r.tx);
                })
              }
              else if (result.status == "failed") {
                console.log("Contract release failed: " + r.tx);
                r.failed = true;
                r.save(function (err) {
                  if (err) return console.log("Failed to save key record");
                  console.log("Updated key record: " + r.tx);
                })
              }
            })
            .catch(function (err) {
              console.log(err);
            })
        });
      })
  }
}
