const MediaProvider = require('../../utils/media-provider-instance');
const BaseController = require('../Controllers/base/BaseController');

const moment = require('moment');
const renderFile = require("ejs").renderFile;
const path = require("path");
const NOTIFICATION_HTML = path.join(__dirname, "../views/message.ejs");

class ControllerDelegator extends BaseController{
  constructor(props){
    super(props);
    
    this.renderMessage = this.renderMessage.bind(this);
    this.getUserEmail = this.getUserEmail.bind(this);
    this.getDatePeriodStart = this.getDatePeriodStart.bind(this);
    this.updateTipStats = this.updateTipStats.bind(this);
    this.updatePlayStats = this.updatePlayStats.bind(this);
    this.getUserName = this.getUserName.bind(this);
    this.getUserAvatar = this.getUserAvatar.bind(this);


    this._loadUser = this._loadUser.bind(this);
    this._loadApiUser = this._loadApiUser.bind(this);
    this._delApiUser = this._delApiUser.bind(this);
    this._notBlank = this._notBlank.bind(this);
  }

  /**
   * render email notification html
   * @param {*} notification 
   * @param {*} callback 
   */
  renderMessage(notification, callback){
    return renderFile(NOTIFICATION_HTML, {notification}, callback);
  }

  getUserEmail(user) {
    if (!user) return null;
    if (user.primaryEmail) return user.primaryEmail;
    if (user.local && user.local.email) return user.local.email;
    if (user.google && user.google.email) return user.google.email;
    if (user.facebook && user.facebook.email) return user.facebook.email;
    if (user.twitter && user.twitter.email) return user.twitter.email;
    if (user.invite && user.invite.invitedAs) return user.invite.invitedAs;
    return null;
  }

 /*
    Get User Avatar (Change ipfs to https link)
 */
  getUserAvatar(avatar) {
    if (!avatar) return null;
    return MediaProvider.resolveIpfsUrl(avatar)
  }

  getUserName(user){
    if (!user) return "New User";
    if (user.google && this._notBlank(user.google.name)) return user.google.name;
    if (user.google && this._notBlank(user.google.username)) return user.google.username;
    if (user.facebook && this._notBlank(user.facebook.name)) return user.facebook.name;
    if (user.facebook && this._notBlank(user.facebook.username)) return user.facebook.username;
    if (user.twitter && this._notBlank(user.twitter.displayName)) return user.twitter.displayName;
    if (user.twitter && this._notBlank(user.twitter.username)) return user.twitter.username;
    if (user.soundcloud && this._notBlank(user.soundcloud.username)) return user.soundcloud.username;
    if (user.local && this._notBlank(user.local.username)) return user.local.username;
    return "New User";
  }

  _notBlank(str){
    return str && str!==""
  }

  getDatePeriodStart(startDate, duration) {
    return duration === "all" ? 0 : moment(startDate).startOf(duration);
  }

  /**
   * update tip count
   * @param {*} db_table 
   * @param {*} conditions 
   * @param {*} tips 
   * @returns promise
   */
  updateTipStats(db_table, conditions, tips){
    const updateParams = {
      $inc: {
        tipCount: tips
      }
    }
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    };
    return db_table.findOneAndUpdate(
      conditions,
      updateParams,
      options
    ).exec();
  }

  /**
   * update tip count
   * @param {*} db_table 
   * @param {*} conditions 
   * @param {*} tips 
   * @returns promise
   */
  updatePlayStats(db_table, conditions, tips){
    const updateParams = {
      $inc: {
        tipCount: tips
      }
    }
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    };
    return db_table.findOneAndUpdate(
      conditions,
      updateParams,
      options
    ).exec();
  }

  _loadUser(profileAddress){
    return this.db.User.findOne({
      profileAddress: profileAddress
    }).exec();
  }

  _loadApiUser(email){
    return this.db.ApiUser.findOne({
      email: email
    }).exec();
  }

  //
  _delApiUser(email){
    return this.db.ApiUser.findOne({
      email: email
    }).remove().exec();
  }


}

module.exports = ControllerDelegator;
