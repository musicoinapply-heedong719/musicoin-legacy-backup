const ControllerDelegator = require('./ControllerDelegator');
const AuthDelegator = require('./AuthDelegator');
const ReleaseDelegator = require('./ReleaseDelegator');

class UserDelegator extends ControllerDelegator{
  constructor(props){
    super(props);

    this.AuthDelegator = new AuthDelegator();
    this.ReleaseDelegator = new ReleaseDelegator();

    this.loadPlaylist = this.loadPlaylist.bind(this);
    this.loadAllPlaylist = this.loadAllPlaylist.bind(this);
    this.getUserBalance = this.getUserBalance.bind(this);

  }

  async loadPlaylist(name, email){
    const playlist = await this.db.Playlist.find({
      name,
      email
    }).populate("release").exec();

    if (playlist) {
      return {
        data: this.response.PlaylistResponse.responseList(playlist)
      }
    }else{
      return {
        error: "playlist not found"
      }
    }
  }

  async loadAllPlaylist(email) {
    const playlist = await this.db.Playlist.find({
      email
    }).populate("release").exec();

    if (playlist) {
      return {
        data: this.response.PlaylistResponse.responseList(playlist)
      }
    }else{
      return {
        error: "playlist not found"
      }
    }
  }

  async getUserBalance(address) {
    if (address) {
      try {
        const balance = await this.MusicoinCore.getUserModule().getUserBalance(address);
        return balance;
      } catch (error) {
        this.logger.error("get user balance error: ", error.message);
        return 0;
      }
    }else{
      return 0;
    }
  }

  async getUserInfoByUser(user) {
    const username = this.getUserName(user);
    //const balance = await this.getUserBalance(user.profileAddress);
    const avatar = user.draftProfile && user.draftProfile.ipfsImageUrl;
    const description = user.draftProfile && user.draftProfile.description;
    const socials = user.draftProfile && user.draftProfile.social;
    const genres = user.draftProfile && user.draftProfile.genres;
    const useremail = user.primaryEmail;

    const userInfo = {
      profileAddress: user.profileAddress || null,
      email: useremail,
      username: username || null,
      avatar: this.getUserAvatar(avatar),
      description: description || null,
      //balance: balance || 0,
      socials: socials || {},
      genres: genres || []
    }
    return userInfo;

  }

  // Like
  async isLiking(userId, trackAddress) {
    const release = await this.db.Release.findOne({ "contractAddress": trackAddress}).exec();
    this.logger.debug("isLiking", JSON.stringify([trackAddress, release]));

    if (release && release.id) {
      const liked = await this.db.Like.findOne({ liker: userId, liking: release.id }).exec();
      this.logger.debug("isLiking", JSON.stringify(liked));
      if (liked) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async startLiking(userId, trackAddress) {
    const release = await this.db.Release.findOne({ "contractAddress": trackAddress}).exec();
    this.logger.debug("startLiking", JSON.stringify([userId, trackAddress, release]));
    if (release) {
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      const inserted = await this.db.Like.findOneAndUpdate({liker: userId, liking: release.id}, {}, options).exec();

      // update user stat
      //const updated = await this.db.UserStats.findOneAndUpdate({user: userId, date: Date.now()}, {$inc: {followCount: 1}}, options).exec();

      return true;
    } else {
      return false;
    }
  }

  async stopLiking(userId, toLike) {
    this.logger.info("stopLiking", JSON.stringify([userId, toLike]));
    const release = await this.db.Release.findOne({ "contractAddress": toLike}).exec();
    if (release) {
      const removed = await this.db.Like.findOneAndRemove({ liker: userId, liking: release.id }).exec();
      return true;
    } else {
      return false;
    }
  }

  async findLikingByUid(userId, skip, limit) {
      const _likings = await this.db.Like.find({ liker: userId }).skip(skip).limit(limit).exec();
      let item;
      let currentUser;
      let likings = [];
      let release;
      for (var i=0;i<_likings.length;i++) {
        item = _likings[i];
        release = await this.ReleaseDelegator._loadReleaseById(item.liking);
        likings.push(release.data);
      }
      return likings;
  }

  // follow
  async isUserFollowing(userId, toFollow) {
    const follower = await this.db.User.findOne({ "profileAddress": toFollow}).exec();
    this.logger.debug("isUserFollowing", JSON.stringify([toFollow, follower]));

    if (follower && follower.id) {
      const followed = await this.db.Follow.findOne({ follower: userId, following: follower.id }).exec();
      this.logger.debug("isUserFollowing", JSON.stringify(followed));
      if (followed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }

  }

  async startFollowing(userId, toFollow) {
    const follower = await this.db.User.findOne({ "profileAddress": toFollow}).exec();
    this.logger.debug("startFollowing", JSON.stringify([userId, toFollow, follower]));
    if (follower) {
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      const inserted = await this.db.Follow.findOneAndUpdate({follower: userId, following: follower.id}, {}, options).exec();

      // update user stat
      //const updated = await this.db.UserStats.findOneAndUpdate({user: userId, date: Date.now()}, {$inc: {followCount: 1}}, options).exec();

      return true;
    } else {
      return false;
    }
  }

  async stopFollowing(userId, toFollow) {
    this.logger.info("stopFollowing", JSON.stringify([userId, toFollow]));
    const follower = await this.db.User.findOne({ "profileAddress": toFollow}).exec();
    if (follower) {
      const removed = await this.db.Follow.findOneAndRemove({ follower: userId, following: follower.id }).exec();
      return true;
    } else {
      return false;
    }

    //const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    //const updated = await this.db.UserStats.findOneAndUpdate({user: userId, date: Date.now()}, {$inc: {followCount: -1}}, options).exec();
  }
  async findFollowingByUid(userId, skip, limit) {
      const _followers = await this.db.Follow.find({ follower: userId }).skip(skip).limit(limit).exec();
      let item;
      let currentUser;
      let followers = [];
      for (var i=0;i<_followers.length;i++) {
        item = _followers[i];
        this.logger.info("findFollowingByUid",item.following);
        currentUser = await this.AuthDelegator._loadUserByUserId(item.following);
        //currentUser = await this.getUserInfoByUser(currentUser);
        followers.push(currentUser);
      }
      return followers;
  }
}

module.exports = UserDelegator;
