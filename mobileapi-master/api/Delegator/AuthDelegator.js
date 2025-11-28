const Promise = require('bluebird');
const ControllerDelegator = require('./ControllerDelegator');

// util
const cryptoUtil = require('../../utils/crypto-util');
const defaultProfileIPFSImage = 'ipfs://QmR8mmsMn9TUdJiA6Ja3SYcQ4ckBdky1v5KGRimC7LkhGF';
const publishCredentialsProvider = require('../Kernel').publishCredentialsProvider;

class AuthDelegator extends ControllerDelegator {
  constructor(props) {
    super(props);

    this.findUserBySocialEmail = this.findUserBySocialEmail.bind(this);
    this.setupNewUser = this.setupNewUser.bind(this);

    this._loadUserByEmail = this._loadUserByEmail.bind(this);
    this._loadUserByPriEmail = this._loadUserByPriEmail.bind(this);
    this._delUserByEmail = this._delUserByEmail.bind(this);
    this._createApiUser = this._createApiUser.bind(this);
    this._createUser = this._createUser.bind(this);
    this._setupNewUserDraftProfile = this._setupNewUserDraftProfile.bind(this);
    this._uploadNewUserProfile = this._uploadNewUserProfile.bind(this);
    this._publishNewUserProfile = this._publishNewUserProfile.bind(this);
    this._updateNewUserState = this._updateNewUserState.bind(this);
  }

  _loadUserByEmail(email) {
    return this.db.User.findOne({'apiEmail': email}).exec();
  }

  _loadUserByUserId(userId) {
    return this.db.User.findOne({'_id': userId}).exec();
  }

  _loadUserByPriEmail(email) {
    return this.db.User.findOne({'primaryEmail': email}).exec();
  }

  findUserBySocialEmail(channel, email) {
    const filter = {};
    filter[channel + '.email'] = email;
    return this.db.User.findOne(filter).exec();
  }

  findUserBySocialId(channel, id) {
    const filter = {};
    filter[`${channel}.id`] = id;
    return this.db.User.findOne(filter).exec();
  }

  createSocialUser(channel, profile) {
    const content = {
      pendingInitialization: true,
      primaryEmail: profile.email,
      emailVerified: true,
    };
    content[channel] = profile;
    return this.db.User.create(content);
  }

  async _createApiUser(email) {
    // generate client secret
    const clientSecret = cryptoUtil.generateToken(this.constant.SECRET_LENGTH);
    // generate access token
    const accessToken = cryptoUtil.generateToken(this.constant.TOKEN_LENGTH);
    // create api user if it doesn't exist already

    let user = await this.db.ApiUser.findOne({'email': email}).exec();

    if (user) {
      return user;
    } else {

      return this.db.ApiUser.create({
        email: email,
        clientSecret: clientSecret,
        timeout: Date.now(),
        accessToken: accessToken,
      });
    }
  }

  _createUser(email, password, username) {
    // create new user
    return this.db.User.create({
      local: {
        email,
        password: cryptoUtil.hashPassword(password),
        username,
      },
      pendingInitialization: true,
      primaryEmail: email,
      emailVerified: true,
      apiEmail: email,
    });
  }

  async setupNewUser(db_user) {
    if (db_user.pendingInitialization) {
      this.logger.debug('start setup new user:' + JSON.stringify(db_user));

      try {
        const user = await this._setupNewUserDraftProfile(db_user);
        this.logger.debug('user:' + JSON.stringify(user));

        const uploadResult = await this._uploadNewUserProfile(user);
        this.logger.debug('user:' + JSON.stringify(user));

        const tx = await this._publishNewUserProfile(user.draftProfile.artistName, uploadResult.descUrl, uploadResult.socialUrl);
        await this._updateNewUserState(user, tx);
      } catch (error) {
        this.logger.error('Error when setupNewUser');
      }
    }
  }

  _setupNewUserDraftProfile(db_user) {
    this.logger.debug('start setup new user draft profile');
    const name = this.getUserName(db_user);
    db_user.draftProfile = {
      artistName: name,
      description: '',
      social: {},
      ipfsImageUrl: defaultProfileIPFSImage,
      heroImageUrl: null,
      genres: [],
      version: 1,
    };
    return db_user.save();
  }

  async _uploadNewUserProfile(db_user) {
    this.logger.debug('start upload new user profile to ipfs:' + JSON.stringify(db_user.draftProfile));

    const descPromise = this.MediaProvider.uploadText(db_user.draftProfile.description);
    const socialPromise = this.MediaProvider.uploadText(JSON.stringify(db_user.draftProfile.social));

    const result = await Promise.all([descPromise, socialPromise]);
    this.logger.debug('_uploadNewUserProfile:' + JSON.stringify([result]));
    return {
      descUrl: result[0],
      socialUrl: result[1],
    };
  }

  async _publishNewUserProfile(name, descUrl, socialUrl) {
    this.logger.debug('start publish new user to blockchain');
    const credentials = await publishCredentialsProvider.getCredentials();
    const releaseRequest = {
      profileAddress: null,
      owner: credentials.account,
      artistName: name,
      imageUrl: defaultProfileIPFSImage,
      socialUrl: socialUrl,
      descriptionUrl: descUrl,
    };
    return this.MusicoinCore.getArtistModule().releaseProfile(releaseRequest, publishCredentialsProvider);
  }

  _updateNewUserState(db_user, tx) {
    db_user.pendingTx = tx;
    db_user.updatePending = true;
    db_user.hideProfile = false;
    db_user.pendingInitialization = false;

    this.logger.debug('start update new user state:' + JSON.stringify(db_user) + '-tx:' + tx);
    return db_user.save();
  }

  //
  _delUserByEmail(email) {
    return this.db.User.findOne({'apiEmail': email}).remove().exec();
  }

  _findUserByUserId(userId) {
    return this.db.User.findById(userId).exec();
  }

  _findUserByProfileAddress(address) {
    return this.db.User.findOne({'profileAddress': address}).exec();
  }

}

module.exports = AuthDelegator;
