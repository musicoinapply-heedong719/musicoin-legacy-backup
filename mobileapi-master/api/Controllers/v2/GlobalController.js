const GlobalControllerV1 = require('../v1/GlobalController');
const UserDelegator = require('../../Delegator/UserDelegator');

class GlobalController extends GlobalControllerV1 {
  constructor(props) {
    super(props);

    this.UserDelegator = new UserDelegator();
  }

  async search(Request, Response, next) {
    try {
      const keyword = Request.query.keyword;
      const limit = this.limit(Request.query.limit);
      const skip = this.skip(Request.query.skip);
      const email = Request.query.email;
      if (!keyword) {
        return this.reject(Request, Response, 'keyword is required.');
      }
      const reg = new RegExp(keyword, 'i');

      let ReleasesArray = [];
      let UsersArray = [];

      const tracksLoad = this.GlobalDelegator._searchTracks(reg, limit, skip);
      const currentUser = await this.AuthDelegator._loadUserByEmail(email);

      const artistsLoad = this.GlobalDelegator._searchArtists(reg, limit, skip);

      try {
        const searchResult = await Promise.all([tracksLoad, artistsLoad]);
        ReleasesArray = this.response.ReleaseResponse.responseList(searchResult[0]);
        ReleasesArray = await this._filterLikeArray(currentUser, ReleasesArray);
        UsersArray = this.response.ArtistResponse.responseList(searchResult[1]);
        UsersArray = await this._filterFollowingArray(currentUser, UsersArray);
      } catch (error) {
        this.logger.error(Request.originalUrl, error);
      }

      const data = {
        tracks: ReleasesArray,
        artists: UsersArray,
      };
      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async _filterLikeArray(user, _tracksLoad) {
    let data = [];
    for (let i = 0; i < _tracksLoad.length; i++) {
      let item = _tracksLoad[i];
      if (user) {
        item.liked = await this.UserDelegator.isLiking(user.id, item.trackAddress);
      } else {
        item.liked = false;
      }

      data.push(item);
    }
    return data;
  }

  async _filterFollowingArray(user, artists) {
    let data = [];
    for (let i = 0; i < artists.length; i++) {
      let artist = artists[i];
      if (user) {
        artist.followed = await this.UserDelegator.isUserFollowing(user.id, artist.artistAddress);
      } else {
        artist.followed = false;
      }

      data.push(artist);
    }
    return data;
  }

}

module.exports = GlobalController;
