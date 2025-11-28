const BaseController = require('../base/BaseController');
const ReleaseDelegator = require('../../Delegator/ReleaseDelegator');
const AuthDelegator = require('../../Delegator/AuthDelegator');

const uuidV4 = require('uuid/v4');

class ReleaseController extends BaseController {
  constructor(props) {
    super(props);

    this.AuthDelegator = new AuthDelegator();
    this.ReleaseDelegator = new ReleaseDelegator(props);

    this.tipTrack = this.tipTrack.bind(this);

  }

  /**
   * body:
   * trackAddress
   * musicoins
   */
  async tipTrack(Request, Response, next) {
    const email = Request.query.email;

    const user = await this.AuthDelegator._loadUserByEmail(email);
    this.logger.debug("[tipTrack]user:"+JSON.stringify(user))

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

      // find track
      const release = await this.ReleaseDelegator._loadTrack(trackAddress);
      if (!release) {
        return this.reject(Request, Response, "Track not found: " + trackAddress);
      }

      // find user
      const sender = await this.ReleaseDelegator._loadUser(USER_ACCOUNT);
      if (!sender) {
        return this.reject(Request, Response, "sender not found: " + USER_ACCOUNT);
      }

      // send tip amount to track address
      const tx = await this.MusicoinCore.getArtistModule().sendFromProfile(USER_ACCOUNT, trackAddress, musicoins);
      this.logger.debug("tip complete: ", tx);
      // increase tip count
      const tipCount = release.directTipCount || 0;
      release.directTipCount = tipCount + musicoins;
      await release.save();
      this.logger.debug("update tipCount: ", release.directTipCount);

      // update release stats
      await this.ReleaseDelegator.updateTrackStats(release._id, musicoins);
      this.logger.debug("update ReleaseStats: ", trackAddress);

      const senderName = sender.draftProfile.artistName;
      const amountUnit = musicoins === 1 ? "coin" : "coins";
      const message = `${senderName} tipped ${musicoins} ${amountUnit} on "${release.title}"`;
      const threadId = uuidV4();
      // find track srtist
      const artist = await this.ReleaseDelegator._loadUser(release.artistAddress);
      const email = this.ReleaseDelegator.getUserEmail(artist);
      // send email to artist
      if (email) {
        this.logger.debug("tip notification to email: ", email);
        this.ReleaseDelegator.notifyTip(email, message, senderName, release.title, threadId);
      }

      // insert a track message to db
      await this.ReleaseDelegator.createTrackMessage(trackAddress, release.artistAddress, release._id,
        artist._id, sender._id, message, threadId);

      this.logger.debug("record track message complete");

      const data = {
        tx: tx
      }
      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

}

module.exports = ReleaseController;
