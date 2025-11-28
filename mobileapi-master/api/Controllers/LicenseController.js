const Promise = require('bluebird');
const LicenseKey = require('../../db/core/key');
const defaultRecords = 20;
const maxRecords = 100;
const defaultMaxGroupSize = 8;

function getLimit(req) {
  return Math.max(0, Math.min(req.query.limit || defaultRecords, maxRecords));
}

class LicenseController {

  constructor(_licenseModule, _accountManager, _publishCredentialsProvider, _paymentAccountCredentialsProvider, _contractOwnerAccount) {
    this.accountManager = _accountManager;
    this.licenseModule = _licenseModule;
    this.publishCredentialsProvider = _publishCredentialsProvider;
    this.paymentAccountCredentialsProvider = _paymentAccountCredentialsProvider;
    this.contractOwnerAccount = _contractOwnerAccount;
  }

  getDetails(Request, Response) {
    this.licenseModule.getLicense(Request.params.address).then(res => {
      Response.send(res)
    })
  }

  async getDetailV1(Request, Response){
    const address = Request.params.address;
    console.log("license address: ",address);
    if(!address){
      return Response.status(400).json({
        status: "error",
        message: "license address is required."
      })
    }

    try {
      const result = await this.licenseModule.getLicense(address);
      if (result) {
        Response.status(200).json(result)
      }else{
        Response.status(400).json({
          error: `not found license: ${address}`
        })
      }
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
  }

  getAudioUrlByAddress(Request, Response) {
    this.licenseModule.getAudioLicense(Request.params.address).then(res => {
      Response.send(res)
    })
  }

  async getNewReleases(Request, Response) {
    try {
      const releases = await this.licenseModule.getNewReleases(getLimit(Request));
      Response.status(200).json(releases)
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
  }

  getTopPlayed(Request, Response) {
    this.licenseModule.getTopPlayed(getLimit(Request), Request.query.genre).then(res => {
      Response.send(res)
    })
  }

  getRandom(Request, Response) {
    this.licenseModule.getSampleOfVerifiedTracks(getLimit(Request), Request.query.genre).then(res => {
      Response.send(res)
    })
  }

  getRandomNew(Request, Response) {
    this.licenseModule.doGetRandomReleases({ ...Request.query,
      limit: getLimit(Request)
    }).then(res => {
      Response.send(res)
    });
  }

  getDetailsByAddresses(Request, Response) {
    this.licenseModule.getTrackDetailsByIds(Request.query.addresses, getLimit(Request)).then(res => {
      Response.send(res)
    });
  }

  find(Request, Response) {
    this.licenseModule.getNewReleasesByGenre(getLimit(Request), defaultMaxGroupSize, Request.query.search).then(res => {
      Response.send(res)
    });
  }

  getPppByAddress(Request, Response) {
    const accountManager = this.accountManager;
    const licenseModule = this.licenseModule;
    const paymentAccountCredentialsProvider = this.paymentAccountCredentialsProvider;
    const context = {};
    const l = this.licenseModule.getLicense(Request.params.address);
    const k = new Promise(function (resolve, reject) {
      LicenseKey.findOne({
        licenseAddress: Request.params.address
      }, function (err, licenseKey) {
        if (!licenseKey) return reject({
          err: "License not found: " + Request.params.address
        });
        return resolve({
          key: licenseKey.key
        });
      })
    });

    Promise.join(l, k, function (license, keyResult) {
        context.output = keyResult;
        return accountManager.pay(Request.query.email, license.weiPerPlay);
      })
      .then(function () {
        return licenseModule.ppp(Request.params.address, paymentAccountCredentialsProvider);
      })
      .then(function (tx) {
        console.log(`Initiated payment, tx: ${tx}`);
        context.output.tx = tx;
        Response.send(context.output);
      })
      .catch(function (err) {
        console.log(err);
        Response.status(400);
        Response.send({
          err: "Failed to acquire key or payment was rejected"
        });
      })
  }


  async getPppByAddressV1(Request, Response) {

    try {
      // load license
      const license = await this.licenseModule.getLicense(Request.params.address);
      if (!license) {
        return Response.status(400).json({
          error: `license not found: ${Request.params.address}`
        })
      }
      // find license key
      const licenseKey = await LicenseKey.findOne({
        licenseAddress: Request.params.address
      }).exec();
      if (!licenseKey) {
        return Response.status(400).json({
          error: `license key not found: ${Request.params.address}`
        })
      }
      // pay to license
      const tx = await this.licenseModule.ppp(Request.params.address, this.paymentAccountCredentialsProvider);
      // adjust user balance
      await this.accountManager.pay(Request.query.email, license.weiPerPlay);

      Response.status(200).json({
        key: licenseKey.key,
        tx
      })

    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
  }

  distributeBalance(Request, Response) {
    licenseModule.distributeBalance(Request.body.address)
      .then(tx => {
        Response.send({
          tx: tx
        });
      })
      .catch(function (err) {
        Response.status(500)
        Response.send(err);
      });
  }

  update(Request, Response) {
    console.log("Received license UPDATE release request: " + JSON.stringify(Request.body));
    licenseModule.updatePPPLicense({
        contractAddress: Request.body.contractAddress,
        title: Request.body.title,
        imageUrl: Request.body.imageUrl,
        metadataUrl: Request.body.metadataUrl,
        contributors: Request.body.contributors,
        coinsPerPlay: 1
      }, this.publishCredentialsProvider)
      .then(txs => {
        Response.json({
          txs: txs
        });
      })
      .catch(err => {
        console.log(err);
        Response.status(500);
        Response.send(err);
      });
  }

  getAll(Request, Response) {
    console.log("Received license release request: " + JSON.stringify(Request.body));
    this.publishCredentialsProvider.getCredentials()
      .then(function (credentials) {
        return licenseModule.releaseLicense({
          owner: this.contractOwnerAccount,
          profileAddress: Request.body.profileAddress,
          artistName: Request.body.artistName,
          title: Request.body.title,
          resourceUrl: Request.body.audioUrl,
          contentType: Request.body.contentType,
          imageUrl: Request.body.imageUrl,
          metadataUrl: Request.body.metadataUrl,
          coinsPerPlay: 1,
          royalties: Request.body.royalties || [],
          contributors: Request.body.contributors || [{
            address: Request.body.profileAddress,
            shares: 1
          }]
        }, this.publishCredentialsProvider)
      })
      .then(function (tx) {
        console.log("Got transaction hash for release request: " + tx);
        res.json({
          tx: tx
        });
        const newKey = new LicenseKey();
        newKey.tx = tx;
        newKey.key = Request.body.encryptionKey;
        newKey.save(err => {
          if (err) console.log(`Failed to save key: ${err}`)
        });

        console.log("Waiting for tx: " + tx);
        licenseModule.getWeb3Reader().waitForTransaction(tx)
          .then(function (receipt) {
            console.log("Got receipt: " + JSON.stringify(receipt));
            newKey.licenseAddress = receipt.contractAddress;
            newKey.save(function (err) {
              if (err) {
                console.log("Failed to save license key!");
                throw err;
              } else {
                Response.send(newKey);
              }
            });
          })
      })
      .catch(err => {
        console.log(err);
        Response.status(500);
        Response.send(err);
      });
  }

  async releaseLicenseV1(Request, Response) {
    const params = Request.body;
    console.log("Received license release request: ", params);
    const licenseModule = this.licenseModule;
    const contractAddress = this.contractOwnerAccount;
    const publishCredentialsProvider = this.publishCredentialsProvider;

    try {
      const credentials = await publishCredentialsProvider.getCredentials();
      // release the license
      const tx = await this.licenseModule.releaseLicense({
        owner: contractAddress,
        profileAddress: params.profileAddress,
        artistName: params.artistName,
        title: params.title,
        resourceUrl: params.resourceUrl,
        contentType: params.contentType,
        imageUrl: params.imageUrl,
        metadataUrl: params.metadataUrl,
        coinsPerPlay: 1,
        royalties: params.royalties || [],
        contributors: params.contributors || [{
          address: Request.body.profileAddress,
          shares: 1
        }]
      }, publishCredentialsProvider);
      console.log("Got transaction hash for release request: " + tx);

      // wait for transaction
      console.log("Waiting for tx: " + tx);
      const receipt = await licenseModule.getWeb3Reader().waitForTransaction(tx);
      console.log("Got receipt: ", receipt);

      // create the license key
      const keyContent = {
        tx: tx,
        key: params.key,
        licenseAddress: receipt.contractAddress
      };
      const _key = new LicenseKey(keyContent);
      const key = await _key.save();
      Response.status(200).json({
        status: "success",
        key
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }

  }
}

module.exports = LicenseController;