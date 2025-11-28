const ControllerDelegator = require('./ControllerDelegator');

const emailUtil = require("../../utils/email");

class ReleaseDelegator extends ControllerDelegator {

  constructor(props) {
    super(props);

    this.updateTrackStats = this.updateTrackStats.bind(this);
    this.loadTrack = this.loadTrack.bind(this);
    this._loadTracks = this._loadTracks.bind(this);
    this._loadReleaseById= this._loadReleaseById.bind(this);
    this.loadRecentTracks = this.loadRecentTracks.bind(this);
    this.notifyTip = this.notifyTip.bind(this);
    this.createTrackMessage = this.createTrackMessage.bind(this);
    this.loadTracksByGenre = this.loadTracksByGenre.bind(this);
    this.loadTracksByArtist = this.loadTracksByArtist.bind(this);
  }

  /**
   * update track tip count when people tip the track
   * @param {*} releaseId 
   * @param {*} amount 
   * @returns promise
   */
  async updateTrackStats(releaseId, amount) {
    const updatePromise = this.updateTipStats;
    const now = Date.now();
    const ReleaseStats = this.db.ReleaseStats;
    return Promise.all(this.constant.DATE_PERIOD.map(duration => {
      const where = {
        release: releaseId,
        startDate: this.getDatePeriodStart(now, duration),
        duration
      }
      return updatePromise(ReleaseStats, where, amount);
    }));
  }

  async loadTrack(address) {
    const release = await this._loadTrack(address);

    if (release) {
      const data = this.response.ReleaseResponse.responseData(release);
      return {
        data
      }
    } else {
      return {
        error: "release not found: " + address
      }
    }
  }

  _loadTrack(address){
    return this.db.Release.findOne({
      contractAddress: address
    }).exec();
  }

  async loadRecentTracks(skip, limit){
    const releases = await this._loadTracks({},{releaseDate: 'desc'},skip,limit);
    if (releases) {
      return {
        data: this.response.ReleaseResponse.responseList(releases)
      }
    }else{
      return {
        error: "tracks not found"
      }
    }
  }


  async _loadTracks(conditions, sort, skip, limit) {
    const artistAddressList = await this.getVerifiedArtist();
    return this.db.Release.find({
      state: 'published',
      markedAsAbuse: {
        $ne: true
      },
      artistAddress: {
        $in: artistAddressList
      },
      ...conditions
    }).sort(sort).skip(skip).limit(limit).exec();
  }

  /**
   * send email to user when tip
   * @param {*} email 
   * @param {*} message 
   * @param {*} senderName 
   */
  notifyTip(email, message, senderName, trackName, threadId){
    const notification = {
      trackName: trackName,
      actionUrl: `https://musicoin.org/nav/thread-page?thread=${threadId}`,
      message: message,
      senderName: senderName
    };
    this.renderMessage(notification, (err, html) => {
      if(err){
        this.logger.debug("tip notify error: ",err.message);
      }else{
        const emailContent = {
          from: "musicoin@musicoin.org",
          to: email,
          subject: `${senderName} commented on ${trackName}`,
          html: html
        }
        emailUtil.send(emailContent).then(result => {
          this.logger.debug("email send complete: ", result);
        }).catch(err=>{
          this.logger.debug("tip notify error: ",err.message);
        });
      }
    })
  }

  async createTrackMessage(trackAddress,artistAddress,trackId,artistId, senderId, message, threadId){
    return this.db.TrackMessage.create({
      artistAddress: artistAddress,
      contractAddress: trackAddress,
      senderAddress: this.constant.UBIMUSIC_ACCOUNT,
      release: trackId,
      artist: artistId,
      sender: senderId,
      message: message,
      replyToMessage: null,
      replyToSender: null,
      threadId: threadId,
      messageType: "tip"
    });
  }

  async loadTracksByGenre(genre,skip,limit){
    const releases = await this._loadTracks({
      genres: genre
    },{},skip,limit);
    if (releases) {
      return {
        data: this.response.ReleaseResponse.responseList(releases)
      }
    }else{
      return {
        error: "tracks not found"
      }
    }
  }

  async loadTracksByArtist(artistAddress,skip,limit){
    const releases = await this._loadTracks({
      artistAddress: artistAddress
    },{
      releaseDate: 'desc'
    },skip,limit);
    if (releases) {
      this.logger.debug(`load tracks by artist: ${artistAddress}, total: ${releases.length}`);
      return {
        data: this.response.ReleaseResponse.responseList(releases)
      }
    }else{
      return {
        error: "tracks not found"
      }
    }
  }

  async _loadReleaseById(id) {
    const release = await this.db.Release.findOne({ "_id": id}).exec();

    if (release) {
      const data = this.response.ReleaseResponse.responseData(release);
      return {
        data
      }
    } 
  }

}

module.exports = ReleaseDelegator;
