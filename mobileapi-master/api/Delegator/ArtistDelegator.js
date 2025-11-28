const ControllerDelegator = require('./ControllerDelegator');

const emailUtil = require("../../utils/email");

class ArtistDelegator extends ControllerDelegator{

  constructor(props){
    super(props);

    this.updateArtistStats = this.updateArtistStats.bind(this);
    this.notifyTip = this.notifyTip.bind(this);
    this.loadArtist = this.loadArtist.bind(this);
    this.loadLatestHero = this.loadLatestHero.bind(this);
    this.loadTrack = this.loadTrack.bind(this);
  }

  /**
   * update user tip count when people tip the artist
   * @param {*} userId
   * @param {*} amount
   * @returns promise
   */
  async updateArtistStats(userId, amount) {
    const updatePromise = this.updateTipStats;
    const now = Date.now();
    const UserStats = this.db.UserStats;
    return Promise.all(this.constant.DATE_PERIOD.map(duration => {
      const where = {
        user: userId,
        startDate: this.getDatePeriodStart(now, duration),
        duration
      }
      return updatePromise(UserStats, where, amount);
    }));
  }

  /**
   * load artist info
   * @param {*} address 
   * @param {*} Response 
   * @returns if error return error message, if success return data
   * {
   *   error: string,
   *   data: obj
   * }
   */
  async loadArtist(address){
    const user = await this.db.User.findOne({
      profileAddress: address
    }).exec();

    //this.logger.debug("loadArtist:",user);
    if (!user) {
      return {
        error: "user not found: "+address
      };
    }
    let response;
    if (user.draftProfile) {
      response = this.response.ArtistResponse.responseData(user);
    }else{
      const artist = await this.MusicoinCore.getArtistModule().getArtistByProfile(address);
      this.logger.debug("artist social: ",artist.socialUrl);
      const description = await this.MediaProvider.fetchTextFromIpfs(artist.descriptionUrl);
      const social = await this.MediaProvider.fetchTextFromIpfs(artist.socialUrl);
      artist.description = description;
      artist.social = JSON.parse(social);
      response = this.response.ArtistResponse.responseMore(artist, user);
    }
    return {
      data: response
    };
  }

  /**
   * send email to user when tip
   * @param {*} email 
   * @param {*} message 
   * @param {*} senderName 
   */
  notifyTip(email, message, senderName, threadId){
    const notification = {
      trackName: null,
      actionUrl: `https://musicoin.org/nav/thread-page?thread=${threadId}`,
      message: message,
      senderName: senderName
    };
    const logger = this.logger;
    this.renderMessage(notification, (err, html) => {
      if(err){
        logger.debug("tip notify error: ",err.message);
      }else{
        const emailContent = {
          from: "musicoin@musicoin.org",
          to: email,
          subject: `${senderName} sent you a message!`,
          html: html
        }
        emailUtil.send(emailContent).then(result => {
          logger.debug("email send complete: ", result);
        }).catch(err=>{
          logger.debug("tip notify error: ",err.message);
        });
      }
    })
  }

  async createTrackMessage(artistAddress, artistId, senderId, message, threadId){
    return this.db.TrackMessage.create({
      artistAddress: artistAddress,
      contractAddress: null,
      senderAddress: this.constant.UBIMUSIC_ACCOUNT,
      release: null,
      artist: artistId,
      sender: senderId,
      message: message,
      replyToMessage: null,
      replyToSender: null,
      threadId: threadId,
      messageType: "tip"
    });
  }

  async loadLatestHero(){
    const heros = await this.db.Hero.find().sort({
      startDate: -1
    }).limit(1).exec();
    const hero = heros ? heros[0] : null;
    if(hero){
      return {
        data: hero
      }
    }else{
      return {
        error: "hero not found"
      }
    }
  }

  async loadTrack(address){
    const release = await this.db.Release.findOne({
      contractAddress: address
    }).exec();

    if (release) {
      const data = this.response.ReleaseResponse.responseData(release);
      return {
        data
      }
    }else{
      return{
        error: "release not found: "+address
      }
    }
  }
}

module.exports = ArtistDelegator;
