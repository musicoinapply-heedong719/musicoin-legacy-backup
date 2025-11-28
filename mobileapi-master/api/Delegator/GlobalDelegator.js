const ControllerDelegator = require('./ControllerDelegator');

const cryptoUtil = require('../../utils/crypto-util');

class GlobalDelegator extends ControllerDelegator {
  constructor(props) {
    super(props);

    this._searchArtists = this._searchArtists.bind(this);
    this._searchTracks = this._searchTracks.bind(this);

    this.searchArtists = this.searchArtists.bind(this);
    this.searchTracks = this.searchTracks.bind(this);

    this.findUserByAddress = this.findUserByAddress.bind(this);
    this.findRleaseByAddress = this.findRleaseByAddress.bind(this);
    this.createReport = this.createReport.bind(this);
    this.directPay = this.directPay.bind(this);
    //
    this.findReceipt = this.findReceipt.bind(this);
    this.delReceipt = this.delReceipt.bind(this);
    this.createReceipt = this.createReceipt.bind(this);
  }

  findReceipt(receiptkey) {
    return this.db.Receipt.findOne({
        receiptkey: receiptkey
    }).exec()
  }

  delReceipt(receiptkey) {
    return this.db.Receipt.findOne({
        receiptkey: receiptkey
    }).remove().exec()
  }

  createReceipt(receipt, coins, email, type, prod, stat) {
    return this.db.Receipt.create({
      receiptkey: cryptoUtil.md5(receipt),
      coins: coins,
      email: email,
      prod: prod,
      stat: stat,
      type: type,
      create_at: Date.now()
    });
  }

  _searchArtists(reg, limit, skip) {
    return this.db.User.find({
      profileAddress: {
        $ne: null
      },
      draftProfile: {
        $exists: true
      },
      "draftProfile.artistName": {
        $regex: reg
      }
    }).skip(skip).limit(limit).exec();
  }

  async searchArtists(reg, limit, skip) {

    const artists = await this._searchArtists(reg, limit, skip);

    if (artists) {
      return {
        data: this.response.ArtistResponse.responseList(artists)
      }
    } else {
      return {
        error: "artists not found"
      }
    }
  }

  async _searchTracks(reg, limit, skip) {
    const artistAddressList = await this.getVerifiedArtist();
    return this.db.Release.find({
      state: 'published',
      markedAsAbuse: {
        $ne: true
      },
      artistAddress: {
        $in: artistAddressList
      },
      $or: [{
        title: {
          $regex: reg
        }
      }]
    }).skip(skip).limit(limit).exec();
  }

  async searchTracks(reg, limit, skip) {
    const releases = await this._searchTracks(reg, limit, skip);
    if (releases) {
      return {
        data: this.response.ReleaseResponse.responseList(releases)
      }
    } else {
      return {
        error: "tracks not found"
      }
    }
  }

  findUserByAddress(address) {
    return this.db.User.findOne({
      profileAddress: address
    }).exec();
  }

  findRleaseByAddress(address) {
    return this.db.Release.findOne({
      contractAddress: address
    }).exec();
  }

  createReport(email, type, reason, targetId, isArtist = false) {
    const reportContent = {
      reportEmail: email,
      reportType: type,
      reason: reason
    }
    if (isArtist) {
      reportContent["artist"] = targetId
    } else {
      reportContent["release"] = targetId
    }

    return this.db.Report.create(reportContent);

  }

  async directPay(trackAddress, musicoins) {

    this.logger.info("[UserDelegator]directPay:"+trackAddress+"-mount:"+musicoins)

    //try {
      const UBIMUSIC_ACCOUNT = this.constant.UBIMUSIC_ACCOUNT;

      const validateResult = this.validate({
        trackAddress,
        musicoins
      }, this.schema.ReleaseSchema.tip);

      if (validateResult !== true) {
        //return validateResult;
        this.logger.error("validateResult: "+validateResult);
        return false;
      }

      // send tip amount to address
      const tx = await this.MusicoinCore.getArtistModule().sendFromProfile(UBIMUSIC_ACCOUNT, trackAddress, musicoins);
      this.logger.debug("tip complete: ", tx);

      const data = {
        tx: tx
      }
      return data;

    /*} catch (error) {
      logger.error("Exception: "+error);
      return false;
    }*/
  }

  async getAnalytics() {
    const releaseTips = await this.db.ReleaseStats.aggregate([
      { $match: { duration: "all" } },
      { $group: { _id: "all", tips: { $sum: "$tipCount" } } }
    ]); 
    const userTips = await this.db.UserStats.aggregate([
      { $match: { duration: "all" } },
      { $group: { _id: "all", tips: { $sum: "$tipCount" } } }
    ]); 

    const playCount = await this.db.ReleaseStats.aggregate([
      { $match: { duration: "all" } },
      { $group: { _id: "all", plays: { $sum: "$playCount" } } } 
    ])  

    this.logger.info("getAnalytics", JSON.stringify([releaseTips, userTips]));
    return { releaseTips:releaseTips[0].tips, userTips:userTips[0].tips, playCount:playCount[0].plays };
  }
}

module.exports = GlobalDelegator;
