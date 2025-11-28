// GLOBAL
const BaseController = require('../base/BaseController');
const AuthDelegator = require('../../Delegator/AuthDelegator');
const UserDelegator = require('../../Delegator/UserDelegator');
const ReleaseDelegator = require('../../Delegator/ReleaseDelegator');
const GlobalDelegator = require('../../Delegator/GlobalDelegator');

const cryptoUtil = require('../../../utils/crypto-util');
const uuidV4 = require('uuid/v4');
const inArray = require('in-array');
const GoogleIABVerifier = require('iab_verifier')
const AppleIAPValidator = require('iap-receipt-validator').default;

class GlobalController extends BaseController {

  constructor(props) {
    super(props);

    this.GlobalDelegator = new GlobalDelegator();
    this.ReleaseDelegator = new ReleaseDelegator(props);
    this.AuthDelegator = new AuthDelegator(props);

    this.search = this.search.bind(this);
    this.reportArtist = this.reportArtist.bind(this);
    this.reportRelease = this.reportRelease.bind(this);

    this.checkServices = this.checkServices.bind(this);
    this.hello = this.hello.bind(this);
    this.analytics = this.analytics.bind(this);
    this.appleIAP = this.appleIAP.bind(this);
    this.googleIAP = this.googleIAP.bind(this);
    // debug
    this.delReceipt = this.delReceipt.bind(this);
  }

  async search(Request, Response, next) {
    try {
      const keyword = Request.body.keyword;
      const limit = this.limit(Request.body.limit);
      const skip = this.skip(Request.body.skip);
      if (!keyword) {
        return this.reject(Request, Response, "keyword is required.");
      }
      const reg = new RegExp(keyword, "i");

      let ReleasesArray = [];
      let UsersArray = [];

      const tracksLoad = this.GlobalDelegator._searchTracks(reg, limit, skip);
      const artistsLoad = this.GlobalDelegator._searchArtists(reg, limit, skip);

      try {
        const searchResult = await Promise.all([tracksLoad, artistsLoad]);
        ReleasesArray = this.response.ReleaseResponse.responseList(searchResult[0]);
        UsersArray = this.response.ArtistResponse.responseList(searchResult[1]);
      } catch (error) {
        this.logger.error(Request.originalUrl, error);
      }

      const data = {
        tracks: ReleasesArray,
        artists: UsersArray
      }
      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async reportArtist(Request, Response, next) {
    try {
      const body = Request.body;
      const email = body.reportEmail;
      const type = body.reportType;
      const reason = body.reason;
      const artistAddress = body.artistAddress;

      const user = await this.GlobalDelegator.findUserByAddress(artistAddress);
      if (!user) {
        return this.reject(Request, Response, "user not found: " + artistAddress);
      }

      await this.GlobalDelegator.createReport(email, type, reason, user._id, true);

      this.success(Request, Response, next, {
        success: true
      })

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async reportRelease(Request, Response, next) {
    try {
      const body = Request.body;
      const email = body.reportEmail;
      const type = body.reportType;
      const reason = body.reason;
      const trackAddress = body.trackAddress;

      const release = await this.GlobalDelegator.findRleaseByAddress(trackAddress);
      if (!release) {
        return this.reject(Request, Response, "track not found: " + trackAddress);
      }

      await this.GlobalDelegator.createReport(email, type, reason, release._id, false);

      this.success(Request, Response, next, {
        success: true
      })

    } catch (error) {
      this.error(Request, Response, error);
    }
  }


  async hello(Request, Response, next) {
    this.success(Request, Response, next, "hello");
  }

  async analytics(Request, Response, next) {
    //const password = Request.query.password;

    /*if (process.env.ADMIN_PWD !== password) {
      return this.reject(Request, Response, "Invalid admin password");
    }*/

    const analytics = await this.GlobalDelegator.getAnalytics();

    this.success(Request, Response, next, analytics);
  }


  async checkServices(Request, Response, next) {
    // load a artist info to check if serices is running
    const artistAddress = "0x411eedd91f172766061d705ed7e71131b84a7654";
    const ipfsHash = "ipfs://QmYV4gXcXaVLFctdTsYADCWcuzzLbcigPkwFzgtrdfHaZw";
    let user;
    let artist;
    let description;
    let testHash;

    const response = {
      mongodb: "running",
      ipfs: "reading n writing",
      gmc: "running"
    }

    try {
      user = await this.db.User.findOne({
        profileAddress: artistAddress
      }).exec();
      this.logger.debug("find user from mongodb: ", user._id);
      this.logger.info("mongodb is running");
    } catch (error) {
      response.mongodb = "error: " + error.message;
      this.logger.info("mongodb running error: " + error.message);
    }

    try {
      artist = await this.MusicoinCore.getArtistModule().getArtistByProfile(artistAddress);
      this.logger.debug("find user from gmc: ", artist);
      this.logger.info("gmc is running");
    } catch (error) {
      response.gmc = "error: " + error.message;
      this.logger.info("gmc running error: " + error.message);
    }

    try {
      description = await this.MediaProvider.fetchTextFromIpfs(ipfsHash);
      this.logger.debug("find artist description from ipfs: ", description);
      this.logger.info("ipfs reading ok");
      testHash = await this.MediaProvider.uploadText("MUSIC");
      this.logger.info("ipfs writing ok:"+testHash);

    } catch (error) {
      response.ipfs = "error: " + error.message;
      this.logger.info("ipfs running error: " + error.message);
    }

    this.success(Request, Response, next, response);
  }


  /*


    Apple IAP callback

  */
  async appleIAP(Request, Response, next) {
    const logger = this.logger;
    const email = Request.query.email;
    const orderid = Request.body.orderid;
    const receipt = Request.body.receipt;
    const UBIMUSIC_ACCOUNT = this.constant.UBIMUSIC_ACCOUNT;

    logger.info("[GlobalController]appleIAP:"+email+"-:"+receipt);

    const sender = await this.ReleaseDelegator._loadUser(UBIMUSIC_ACCOUNT);
    if (!sender) {
      return this.reject(Request, Response, "sender not found: "+UBIMUSIC_ACCOUNT);
    }

    const itunes_shared_secret = process.env.ITUNES_SHARED_SECRET?process.env.ITUNES_SHARED_SECRET:'';
    if (itunes_shared_secret == '') {
        return this.reject(Request, Response, "Invaid secret");
    }

    const validateReceiptProd = AppleIAPValidator(itunes_shared_secret, true);
    const validateReceiptSand = AppleIAPValidator(itunes_shared_secret, false);

    const user = await this.AuthDelegator._loadUserByEmail(email);
    let stat = 0;
    if (!user.profileAddress) {
        stat = 1001;
        //return this.reject(Request, Response, "Your wallet is not ready, please contact us(support@musicoin.org) for support .");
    }

    var result = {};
    var productId = "";
    var xx = {};
    try {
      const validationDataProd = await validateReceiptProd(receipt);

      productId = validationDataProd.receipt.in_app[0].product_id;
      xx = productId.split("_");

      let receiptRecord = await this.GlobalDelegator.findReceipt(cryptoUtil.md5(receipt));
      if (receiptRecord) {
        return this.reject(Request, Response, "Receipt is expired");
      } else {
        await this.GlobalDelegator.createReceipt(receipt, parseInt(xx[1]), email, "apple", true, stat);
        if (stat == 0) {
            result = await this.GlobalDelegator.directPay(user.profileAddress, parseInt(xx[1]));
            return this.success(Request, Response, next, result);
        } else {
            return this.reject(Request, Response, "Your wallet is not ready, please contact us(support@musicoin.org) for support .");
        }
      }

    } catch (error) {
      logger.error("validationDataProd error:"+error);

      try {

        const validationDataSand = await validateReceiptSand(receipt);

        productId = validationDataSand.receipt.in_app[0].product_id;
        xx = productId.split("_");

        let receiptRecord = await this.GlobalDelegator.findReceipt(cryptoUtil.md5(receipt));
        if (receiptRecord) {

          return this.reject(Request, Response, "Receipt is expired");
        } else {

          await this.GlobalDelegator.createReceipt(receipt, parseInt(xx[1]), email, "apple", false, stat);
          if (stat == 0) {
              result = await this.GlobalDelegator.directPay(user.profileAddress, parseInt(xx[1]));
              return this.success(Request, Response, next, result);
          } else {
              return this.reject(Request, Response, "Your wallet is not ready, please contact us(support@musicoin.org) for support .");
          }
        }

      } catch (error) {
        return this.reject(Request, Response, "Invalid payment receipt");
      }

    }
  }


  /*
    Validate google payment
  */

  async googleIAP(Request, Response, next) {
    const logger = this.logger;
    const email = Request.query.email;
    const signature = Request.body.signature;
    const receipt = Request.body.receipt;

    const google_pub_key = process.env.GOOGLE_PUB_KEY ? process.env.GOOGLE_PUB_KEY : 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAooNcEwsUnK74Krn4KQC/S4tux3dwxLvxt/Tb96CfnnxrU7edwR9GWNZYT+P7X7swMUu38ka5rJOnEUaAp5kQ+rfccn6Euh4vgv0zAo0ul7KtaOUXLbD3VrzUD6Rhrxo449rmk98eSLGL/An5bWPle4kUs2xqIsY6CCPCFL87X4+RiETcZ4uy4ab6yBJ5c0yYhvWEcOnQdOGLOnf62SMboq/cJK4/CRFqLFoghPAPFfYctea7+gRK4Gh3OarqJaB4ErFgoriEmYD7R4I0bCYkHpctzLCB//TFHF7OEaJwjpz0qbxD89v7rKbqTFwEXnaAMC2YdZIpOSxq3A3fNS+KsQIDAQAB';

    logger.info("[GlobalController]googleIAP:"+email+"-:"+signature+":"+receipt+":"+google_pub_key);

    const receiptOBJ = JSON.parse(receipt);
    const productId = receiptOBJ.productId;

    const UBIMUSIC_ACCOUNT = this.constant.UBIMUSIC_ACCOUNT;

    const sender = await this.ReleaseDelegator._loadUser(UBIMUSIC_ACCOUNT);
    if (!sender) {
      return this.reject(Request, Response, "sender not found: "+UBIMUSIC_ACCOUNT);
    }

    if (google_pub_key == '') {
        return this.reject(Request, Response, "Invaid public key");
    }

    const user = await this.AuthDelegator._loadUserByEmail(email);

    let stat = 0;
    if (!user.profileAddress) {
        stat = 1;
    }


    var googleplayVerifier = new GoogleIABVerifier(google_pub_key);

    var verifyResult = await googleplayVerifier.verifyReceipt(receipt, signature);

    var result = {};

    if (verifyResult) {
      var xx = productId.split("_");

      let receiptRecord = await this.GlobalDelegator.findReceipt(cryptoUtil.md5(receipt));
      if (receiptRecord) {
        return this.reject(Request, Response, "Receipt is expired");
      } else {
        await this.GlobalDelegator.createReceipt(receipt, parseInt(xx[1]), email, "google", true, stat);

        if (stat == 0) {
            result = await this.GlobalDelegator.directPay(user.profileAddress, parseInt(xx[1]));
            return this.success(Request, Response, next, result);
        } else {
            return this.reject(Request, Response, "Your wallet is not ready, please contact us(support@musicoin.org) for support .");
        }
      }

    } else {
      return this.reject(Request, Response, "Invalid payment receipt");
    }

  }


  async delReceipt(Request, Response, next) {
    const debug = process.env.DEBUG ? process.env.DEBUG : 0; // should be change to false by default
    if (!debug) {
        return this.reject(Request, Response, "debug not allowed");
    }
    const body = Request.body;
    const receipt = body.receipt;

    let receiptRecord = await this.GlobalDelegator.findReceipt(cryptoUtil.md5(receipt));
    if (!receiptRecord) {
      return this.error(Request, Response, "Receipt not found");
    } else {

      await this.GlobalDelegator.delReceipt(cryptoUtil.md5(receipt));
      this.success(Request,Response, next, {message: "OK"});
    }
  }

  /**
   * Direct Send: TODO
   * body:
   * profileAddress
   * musicoins
   */
  async directTransfer(Request, Response, next) {
    const logger = this.logger;
    const email = Request.query.email;

    const user = await this.AuthDelegator._loadUserByEmail(email);
    logger.debug("[directSend]user:"+JSON.stringify(user))

    try {
      const musicoins = Request.body.musicoins || 10;
      const trackAddress = Request.body.trackAddress;
      const USER_ACCOUNT = user.profileAddress; //"0xc973b1c475f160c361d017fa762e6a3aa991f11c";
      const balance = + user.balance;

      const validateResult = this.validate({
        trackAddress,
        musicoins
      }, this.schema.ReleaseSchema.tip);

      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      // find user
      const sender = await this.ReleaseDelegator._loadUser(USER_ACCOUNT);
      if (!sender) {
        return this.reject(Request, Response, "sender not found: " + USER_ACCOUNT);
      }

      // TODO

      const data = {
        tx: ""
      }
      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }
}

module.exports = GlobalController;
