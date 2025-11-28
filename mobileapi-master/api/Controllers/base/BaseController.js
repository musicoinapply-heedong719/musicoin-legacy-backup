const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const constant = require('../../constant');

// db model
const User = require('../../../db/core/user');
const ApiUser = require('../../../db/core/api-user');
const Hero = require('../../../db/core/hero');
const ApiPackage = require('../../../db/core/api-package');
const IPFSResource = require('../../../db/core/ipfs-resource');
const LicenseKey = require('../../../db/core/key');
const Playlist = require('../../../db/core/playlist');
const ReleaseStats = require('../../../db/core/release-stats');
const Release = require('../../../db/core/release');
const TipHistory = require('../../../db/core/tip-history');
const TrackMessage = require('../../../db/core/track-message');
const UserPlayback = require('../../../db/core/user-playback');
const UserStats = require('../../../db/core/user-stats');
const Report = require("../../../db/core/report");
const Follow = require("../../../db/core/follow");
const Like = require("../../../db/core/like");
const Receipt = require("../../../db/core/receipt");

// validator schema
const AuthSchema = require('../../ValidatorSchema/AuthSchema');
const PackageSchema = require('../../ValidatorSchema/PackageSchema');
const PlaylistSchema = require('../../ValidatorSchema/PlaylistSchema');
const ReleaseSchema = require('../../ValidatorSchema/ReleaseSchema');
const UserSchema = require('../../ValidatorSchema/UserSchema');
const GlobalSchema = require('../../ValidatorSchema/GlobalSchema');

// response data
const ArtistResponse = require('../../response-data/v1/artist-model');
const ReleaseResponse = require('../../response-data/v1/release-model');
const PlaylistResponse = require('../../response-data/v1/playlist-model');

// logger
const Logger = require('../../../utils/Logger');

// musicoin core
const MusicoinCore = require('../../Kernel').musicoinCore;

// media provider
const MediaProvider = require('../../../utils/media-provider-instance');

// verified artist
let verifiedList = [];

async function checkUserVerified(){
    // load verified users
    try {
      const list = await User.find({
        verified: true,
        profileAddress: {
          $exists: true,
          $ne: null
        }
      })
      .exec();
      verifiedList = list.map(val => val.profileAddress);
      Logger.debug("get verified users: ",verifiedList.length);
    } catch (error) {
      setTimeout(checkUserVerified, 1000*5);
      Logger.debug("get verified users error: ", error.message);
    }
}

checkUserVerified();
setInterval(checkUserVerified, 1000*60*60);

/**
 * all route controller extends BaseController
 */
class BaseController {

  constructor(props) {
    // constant var
    this.constant = constant;

    // db model
    this.db = {
      User,
      ApiUser,
      Hero,
      ApiPackage,
      IPFSResource,
      LicenseKey,
      Playlist,
      Release,
      ReleaseStats,
      TipHistory,
      TrackMessage,
      UserPlayback,
      UserStats,
      Report,
      Follow,
      Like,
      Receipt
    }

    // validator schema
    this.schema = {
      AuthSchema,
      PackageSchema,
      PlaylistSchema,
      ReleaseSchema,
      UserSchema,
      GlobalSchema
    }

    // response data
    this.response = {
      ArtistResponse,
      ReleaseResponse,
      PlaylistResponse
    }

    // logger
    this.logger = Logger;

    // web3 core util
    this.MusicoinCore = MusicoinCore;

    // ipfs core util
    this.MediaProvider = MediaProvider;

    this.validate = this.validate.bind(this);
    this.error = this.error.bind(this);
    this.success = this.success.bind(this);
    this.reject = this.reject.bind(this);
    this.limit = this.limit.bind(this);
    this.skip = this.skip.bind(this);
    this.checkParams = this.checkParams.bind(this);
    this.sendJson = this.sendJson.bind(this);
    this.sendStream = this.sendStream.bind(this);
  }

  /**
   * validate request params
   * @param {*} body 
   * @param {*} schema 
   * @return true or error message
   */
  validate(body, schema) {
    const result = Validator.validate(body, schema);
    if(result === true){
      return true
    }else{
      return result[0].message
    }
  }

  /**
   * request error
   * @param {*} Response 
   * @param {*} error 
   */
  error(Request, Response, error) {
    const url = Request.originalUrl;
    let msg;
    if (error instanceof Error) {
      msg = error.message;
    } else {
      msg = error;
    }
    this.logger.error(url, error);
    Response.status(500).json({
      error: msg
    })
  }

  /**
   * handle success
   * @param {*} Response 
   * @param {*} data 
   */
  success(Request, Response, next, data) {
    if(Request.response){
      Request.response = {
        ...Request.response,
        data
      }
    }else{
      Request.response = data;
    }
    next();
  }

  /**
   * response json data to api caller
   * @param {*} Request 
   * @param {*} Response 
   */
  sendJson(Request, Response) {
    const data = Request.response;
    Response.status(200).json(data)
  }

  /**
   * response stream data to api caller
   * @param {*} Request 
   * @param {*} Response 
   */
  sendStream(Request, Response) {
    const data = Request.response;
    Response.sendSeekable(data.stream,data.options);
  }

  /**
   * request rejest
   * @param {*} Response 
   * @param {*} error 
   */
  reject(Request, Response, message) {
    const url = Request.originalUrl;
    this.logger.warn(url, message);
    Response.status(400).json({
      error: message
    })
  }

  /**
   * 
   * @param {*} limit 
   */
  limit(num) {
    if (num) {
      const parseNum = Number(num);
      return parseNum > 0 ? (parseNum > 20 ? 20 : parseNum) : 10
    }
    return 10
  }

  skip(num){
    if (num) {
      const parseNum = Number(num);
      return parseNum > 0 ? parseNum : 0
    }
    return 0
  }

  async getVerifiedArtist(){
    if (!verifiedList || verifiedList.length === 0) {
      await checkUserVerified();
    }
    return verifiedList;
  }

  checkParams(schema){
    return (Request, Response, next) => {
      let params;
      if(Request.method === 'POST'){
        params = Request.body;
      }else{
        params = Request.query;
      }
      const validateResult = this.validate(params, schema);
      if (validateResult === true) {
        next();
      }else{
        this.reject(Request,Response,validateResult);
      }
    }
  }
}

module.exports = BaseController;
