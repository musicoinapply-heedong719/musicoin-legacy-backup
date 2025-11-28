const BaseController = require('../base/BaseController');
const UserDelegator = require('../../Delegator/UserDelegator');
const AuthDelegator = require('../../Delegator/AuthDelegator');
const ReleaseDelegator = require('../../Delegator/ReleaseDelegator');

class UserController extends BaseController {

  constructor(props) {
    super(props);

    this.UserDelegator = new UserDelegator();
    this.AuthDelegator = new AuthDelegator();
    this.ReleaseDelegator = new ReleaseDelegator();

    this.getPlayList = this.getPlayList.bind(this);
    this.addPlayList = this.addPlayList.bind(this);
    this.getAllPlayList = this.getAllPlayList.bind(this);
    this.deletePlayList = this.deletePlayList.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);

    this.follow = this.follow.bind(this);
    this.unfollow = this.unfollow.bind(this);
    this.following = this.following.bind(this);

    //
    this.like = this.like.bind(this);
    this.unlike = this.unlike.bind(this);
    this.liking = this.liking.bind(this);
  }

  async getUserInfo(Request, Response, next){
    const email = Request.query.email;
    try {
      const user = await this.AuthDelegator._loadUserByEmail(email);
      this.logger.debug("[getUserInfo]user:"+JSON.stringify(user))
      if (!user) {
        return this.error(Request,Response, "Please re-login");
      }

      const username = this.UserDelegator.getUserName(user);
      const balance = await this.UserDelegator.getUserBalance(user.profileAddress);
      const avatar = user.draftProfile && user.draftProfile.ipfsImageUrl;
      const description = user.draftProfile && user.draftProfile.description;
      const socials = user.draftProfile && user.draftProfile.social;
      const genres = user.draftProfile && user.draftProfile.genres;
      const useremail = user.primaryEmail;

      const userInfo = {
        profileAddress: user.profileAddress || null,
        email: useremail,
        username: username || null,
        avatar: this.UserDelegator.getUserAvatar(avatar),
        description: description || null,
        balance: balance || 0,
        socials: socials || {},
        genres: genres || []
      }

      const response = {
        user: userInfo
      }

      this.success(Request,Response,next,response);

    } catch (error) {
      this.error(Request,Response, error);
    }

  }

  async getPlayList(Request, Response, next) {
    try {

      const name = Request.query.name;
      const email = Request.query.email;

      // validate params
      const validateResult = this.validate(Request.query, this.schema.PlaylistSchema.getOne);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      const playlistLoad = await this.UserDelegator.loadPlaylist(name, email);
      if (playlistLoad.error) {
        return this.reject(Request, Response, playlistLoad.error);
      }

      const data = {
        playlist: playlistLoad.data
      }
      this.success(Request, Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getAllPlayList(Request, Response, next) {
    try {
      const  email =  Request.query.email;
      // validate params
      const validateResult = this.validate(Request.query, this.schema.PlaylistSchema.getAll);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      const playlistLoad = await this.UserDelegator.loadAllPlaylist(email);
      if (playlistLoad.error) {
        return this.reject(Request, Response, playlistLoad.error);
      }

      const data = {
        playlist: playlistLoad.data
      }
      this.success(Request, Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * params:
   * name
   * email
   * trackAddress
   */
  async addPlayList(Request, Response, next) {
    try {
      const name = Request.body.name;
      const trackAddress = Request.body.trackAddress;
      const email = Request.query.email;
      // validate params
      const validateResult = this.validate({
        name,
        trackAddress,
        email
      }, this.schema.PlaylistSchema.add);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      // find release
      const release = await this.db.Release.findOne({
        contractAddress: trackAddress
      }).exec();

      if (!release) {
        return this.reject(Request, Response, "track not found: " +trackAddress);
      }
      const content = {
        name: name,
        email: email,
        release: release._id
      };
      await this.db.Playlist.findOneAndUpdate(content, content, {
        upsert: true
      }).exec();

      const data = {
        success: true
      }
      this.success(Request, Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async deletePlayList(Request, Response, next) {
    try {
      const name = Request.body.name;
      const trackAddress = Request.body.trackAddress;
      const email = Request.query.email;
      // validate params
      const validateResult = this.validate({
        name,
        trackAddress,
        email
      }, this.schema.PlaylistSchema.deleteOne);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      // find release
      const release = await this.db.Release.findOne({
        contractAddress: trackAddress
      }).exec();

      if (!release) {
        return this.reject(Request, Response, "track not found: " + trackAddress);
      }
      const content = {
        name: name,
        email: email,
        release: release._id
      };

      await this.db.Playlist.findOneAndDelete(content).exec();

      const data = {
        success: true
      }
      this.success(Request, Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async follow(Request, Response, next) {
    const email = Request.query.email;
    const follower = Request.body.follower;

    this.logger.info("follow", JSON.stringify(email, follower));

    const currentUser = await this.AuthDelegator._loadUserByEmail(email);
    const followUser = await this.AuthDelegator._findUserByProfileAddress(follower);
    //this.logger.debug("currentUser", JSON.stringify(currentUser));
    //this.logger.debug("followUser", JSON.stringify(followUser));

    if (!currentUser || !followUser) {
      return this.reject(Request, Response, "Following User not found, please check");
    }

    const currentUserId = currentUser.id;
    const ret = await this.UserDelegator.isUserFollowing(currentUserId, follower);
    if (ret) {
      return this.reject(Request, Response, "Following User has been followed");

    } else {
      const followed = await this.UserDelegator.startFollowing(currentUserId, follower);
      if (followed) {
        const data = {
          success: true
        }
        this.success(Request, Response, next, data);
      } else {
      return this.error(Request, Response, "Failed to follow");
      }
    }
  }

  async unfollow(Request, Response, next) {
    const email = Request.query.email;
    const follower = Request.body.follower;

    this.logger.info("unfollow", JSON.stringify(email, follower));

    const currentUser = await this.AuthDelegator._loadUserByEmail(email);
    const followUser = await this.AuthDelegator._findUserByProfileAddress(follower);

    if (!currentUser || !followUser) {
      return this.reject(Request, Response, "Following User not found, please check");
    }

    const currentUserId = currentUser.id;
    const ret = await this.UserDelegator.isUserFollowing(currentUserId, follower);
    if (!ret) {
      return this.reject(Request, Response, "Following User has not been followed");

    } else {
      this.logger.info("HERE")
      const followed = await this.UserDelegator.stopFollowing(currentUserId, follower);
      if (followed) {
        const data = {
          success: true
        }
        this.success(Request, Response, next, data);

      } else {
        return this.error(Request, Response, "Failed to unfollow");
      }
    }
  }

  async following(Request, Response, next) {
    const email = Request.query.email;
    const limit = this.limit(Request.query.limit);
    const skip = this.skip(Request.query.skip);

    const currentUser = await this.AuthDelegator._loadUserByEmail(email);

    const currentUserId = currentUser.id;
    this.logger.info("following", JSON.stringify(email));
    const _followers = await this.UserDelegator.findFollowingByUid(currentUserId, skip, limit);
    const followers = this.response.ArtistResponse.responseList(_followers);

    const data = {
      success: true,
      artists: followers
    };
    return this.success(Request, Response, next, data);
  }

  //

  async like(Request, Response, next) {
    const email = Request.query.email;
    const trackAddress = Request.body.trackAddress;

    this.logger.info("like", JSON.stringify(email, trackAddress));

    const currentUser = await this.AuthDelegator._loadUserByEmail(email);

    const likedRelease = await this.ReleaseDelegator.loadTrack(trackAddress);

    if (trackAddress && !likedRelease) {
      return this.reject(Request, Response, "Release not found, please check");
    }

    const currentUserId = currentUser.id;
    const ret = await this.UserDelegator.isLiking(currentUserId, trackAddress);
    if (ret) {
      return this.reject(Request, Response, "Release has been liked");

    } else {

      // start to transfer coin
      const musicoins = 1; // like coin
      const USER_ACCOUNT = currentUser.profileAddress; //"0xc973b1c475f160c361d017fa762e6a3aa991f11c";

      const validateResult = this.validate({
        trackAddress,
        musicoins
      }, this.schema.ReleaseSchema.tip);

      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }
      const release = await this.ReleaseDelegator._loadTrack(trackAddress);
      if (!release) {
        return this.reject(Request, Response, "Track not found: " + trackAddress);
      }

      // find user
      const sender = await this.ReleaseDelegator._loadUser(USER_ACCOUNT);
      if (!sender) {
        return this.reject(Request, Response, "sender not found: " + USER_ACCOUNT);
      }

      let tx;
      try {
        //tx = await this.MusicoinCore.getArtistModule().sendFromProfile(USER_ACCOUNT, trackAddress, musicoins);
        tx = await this.MusicoinCore.getArtistModule().sendFromProfile(USER_ACCOUNT, this.constant.UBIMUSIC_ACCOUNT, musicoins);
      } catch (error) {
        return this.error(Request, Response, error);
      }

      // update release stats
      await this.ReleaseDelegator.updateTrackStats(release._id, musicoins);
      this.logger.debug("update ReleaseStats: ", trackAddress);

      // start to like
      const liked = await this.UserDelegator.startLiking(currentUserId, trackAddress);
      if (liked) {
        const data = {
          tx: tx,
          success: true
        }
        return this.success(Request, Response, next, data);
      } else {
        return this.error(Request, Response, "Failed to like");
      }
    }

    const data = { success: true };
    return this.success(Request, Response, next, data);
  }

  async unlike(Request, Response, next) {
    const email = Request.query.email;
    const trackAddress = Request.body.trackAddress;

    this.logger.info("unlike", JSON.stringify(email, trackAddress));

    const currentUser = await this.AuthDelegator._loadUserByEmail(email);
    const likedRelease = await this.ReleaseDelegator.loadTrack(trackAddress);

    if (trackAddress && !likedRelease) {
      return this.reject(Request, Response, "Release not found, please check");
    }

    const currentUserId = currentUser.id;
    const ret = await this.UserDelegator.isLiking(currentUserId, trackAddress);
    if (!ret) {
      return this.reject(Request, Response, "Release has not been liked");

    } else {
      const liked = await this.UserDelegator.stopLiking(currentUserId, trackAddress);
      if (liked) {
        const data = {
          success: true
        }
        this.success(Request, Response, next, data);

      } else {
        return this.error(Request, Response, "Failed to unlike");
      }
    }
  }

  async liking(Request, Response, next) {
    const email = Request.query.email;
    const limit = this.limit(Request.query.limit);
    const skip = this.skip(Request.query.skip);

    const currentUser = await this.AuthDelegator._loadUserByEmail(email);

    const currentUserId = currentUser.id;
    const likings = await this.UserDelegator.findLikingByUid(currentUserId, skip, limit);
    //this.logger.info("liking", JSON.stringify(_likings));
    //const likings = this.response.ReleaseResponse.responseList(_likings);

    const data = {
      success: true,
      tracks: likings
    };
    return this.success(Request, Response, next, data);
  }

}

module.exports = UserController;
