/**
 *
 *   MODELS
 *
 * */
const User = require('../../db/core/user');
const ApiUser = require('../../db/core/api-user');
const Release = require('../../db/core/release');
const Playlist = require('../../db/core/playlist');
const Package = require('../../db/core/api-package');
/**
 *   VALIDATION SCHEMAS
 */
const UserSchema = require('../ValidatorSchema/UserSchema');
/**
 *  LIBS
 *
 * */
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const async = require('async');
const crypto = require('crypto');


const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
/**
 *
 * User Controller class
 *
 *
 * Main user functional
 *
 * playlist create, delete, get
 *
 * useraccount delete
 *
 * */
const kInitialMaxBlocks = 5000;
const kMinBlocksToProcess = 10000;
const kMaxBlocksToProcess = 100000;
const kDefaultTargetNumberOfTransactions = 5000;

class UserController {

  constructor(web3, config) {
    this.config = config;
    this.web3 = web3;
  }

  getBalance(Request, Response) {
    this.web3.getBalanceInMusicoins(Request.params.address).then(res => {
      Response.send({
        success: true,
        balance: Number(res)
      });
    }).catch(Error => {
      Response.send(Error.message);
    })
  }

  renewMember(Request, Response) {
    const validation = Validator.validate(Request.body, UserSchema.renew);
    let $this = this;

    if (validation === true) {
      this.web3.getTransaction(Request.body.txReceipt).then(async res => {
        if (res && res.from === Request.body.publicKey && res.to == $this.config.contractOwnerAccount) {
          let web3 = this.web3.getWeb3();
          if ((web3.eth.blockNumber - res.blockNumber)) {
            Response.send({
              success: false,
              message: 'Block height greater then 1000'
            });
            return;
          }
          const amount = this.web3.convertWeiToMusicoins(res.value);
          let membershipLevel = 1;

          if (amount >= 1499.5 && amount <= 1500.5) {
            membershipLevel = 2
          } else if (amount >= 4999.5 && amount <= 5000.5) {
            membershipLevel = 3;
          }

          let user = await User.findOne({
            profileAddress: res.from
          });

          if (user) {
            let joinDate = new Date(user.joinDate);
            let now = new Date();
            let membershipDuration = parseInt((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
            if (membershipDuration > 356) {
              Response.send({
                success: false,
                message: 'The membership days count more than 356'
              });
              return;
            }
            if (user.membershipLevel !== membershipLevel) {
              user.membershipLevel = membershipLevel;
              user.save();
            }
            Response.send({
              success: true,
              days: parseInt((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)),
              membershipLevel: membershipLevel,
              name: user.draftProfile ? user.draftProfile.artistName : user.local.username,
              artistURL: 'https://musicoin.org/nav/artist/' + user.profileAddress
            })
          } else {
            Response.send({
              success: false,
              message: 'There are no such user founded',
              txInfo: res
            })
          }
        } else {
          Response.send({
            success: false
          })
        }
      }).catch(Error => {
        Response.send({
          error: Error.message
        })
      })
    } else {
      Response.status(400);
      Response.send({
        success: false,
        error: validation
      })
    }
  }

  async generateToken(Request, Response) {
    const user = await ApiUser.findOne({
      email: Request.query.email
    });
    const deletingToken = this.randomTokenGenerate(40);
    Request.session.deletingToken = deletingToken;
    Request.session.user = user;
    Response.send({
      token: Request.session.deletingToken
    });
  }

  async deleteUserAccount(Request, Response) {
    const user = await User.findOne({
      "local.email": Request.session.user.email
    });
    const ApiUserAccount = await ApiUser.findById(mongoose.Types.ObjectId(Request.session.user._id));
    if (Request.session.deletable) {
      try {
        await user.remove();
        await ApiUserAccount.remove();
        Request.session.destroy();
        Response.send({
          success: true,
          message: 'Account was successfully deleted'
        });
      } catch (Error) {
        Response.status(400);
        Response.send({
          success: false,
          message: Error.message
        });
      }
    } else {
      Response.status(400);
      Response.send({
        success: false,
        message: 'Verify deletion with token before deletion'
      })
    }
  }

  verifyUserAccountDeleting(Request, Response) {
    let token = Request.params.token;
    if (token === Request.session.deletingToken) {
      Request.session.deletable = true;
      Response.send({
        success: true
      });
    } else {
      Response.send({
        success: false,
        error: 'Wrong deletable token'
      });
    }
  }

  isMember(Request, Response) {

    try {
      User.findOne({
        "local.email": Request.query.email
      }).then(user => {
        if (user) {
          let joinDate = new Date(user.joinDate);
          let now = new Date();
          const daysRemaning = parseInt((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24), 10);
          Response.send({
            success: true,
            daysRemaning: daysRemaning,
            membershipLevel: user.membershipLevel
          });
        } else {
          Response.status(400);
          Response.send({
            success: false
          });
        }
      }).catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error
        });
      });
    } catch (Error) {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    }
  }

  getUserInfo(Request, Response) {
    User.findOne({
      "local.email": Request.query.email
    }).then(async user => {
      if (!user) {
        Response.status(400);
        Response.send({
          success: false,
          error: 'There are no such user founded'
        });
        return;
      }

      let ResponseInstance = {
        createdBy: this.config.publishingAccount,
        artistName: user.draftProfile.artistName || '',
        contractVersion: this.config.contractVersion,
        imageUrl: user.draftProfile.ipfsImageUrl || '',
        followers: user.followerCount,
        socialUrl: '',
        tipCount: 0,
        balance: 0,
        forwardingAddress: this.config.forwardingAddress,
        descriptionUrl: '',
        prettyUrl: '',
        membershipLevel: user.membershipLevel
      };

      if (user.draftProfile.social) {
        ResponseInstance.socialUrl = user.draftProfile.social.socialUrl || '';
      }

      try {
        const tipCount = await Release.aggregate({
          $match: {
            artist: mongoose.Types.ObjectId(user._id)
          }
        }, {
          $group: {
            _id: mongoose.Types.ObjectId(user._id),
            total: {
              $sum: '$directTipCount'
            },
          }
        });
        if (tipCount.length > 0) {
          ResponseInstance.tipCount = tipCount[0].total;
        }
      } catch (Error) {
        Response.send(400, {
          success: false,
          error: Error.message
        });
      }

      const apiUser = await ApiUser.findOne({
        email: user.local.email
      });

      ResponseInstance.balance = apiUser.balance;
      Response.send(ResponseInstance);

    }).catch(Error => {

      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    })
  }

  apiGetUsageStats(Request, Response) {
    ApiUser.findOne({
      email: Request.query.email
    }).populate('tier').then(apiuser => {
      if (apiuser) {
        if (apiuser.tier !== undefined) {
          Response.send({
            tier: apiuser.tier.name,
            calls: apiuser.calls
          });
        } else {
          Response.send({
            // if no tier is assigned, he's on the free tier
            tier: 'Free Tier',
            calls: apiuser.calls
          });
        }
      }
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      })
    });
  }

  randomTokenGenerate(count) {
    return crypto.randomBytes(count).toString('hex');
  }

  createPlaylist(Request, Response) {
    User.findOne({
      "local.email": Request.query.email,
    }).then(user => {
      console.log("COOL");
      Playlist.create({
        name: Request.body.name,
        user: {
          email: user.local.email,
          profileAddress: user.profileAddress,
          userId: user._id,
          name: user.local.username
        },
        songs: Request.body.songs
      }).then(playlist => {
        Response.send({
          success: true,
          playlistName: playlist.name,
          playlistUrl: 'http://musicoin.org/playlist/' + playlist.name,
          creatorName: playlist.user.name,
          creatorUrl: 'http://musicoin.org/artist/nav/' + playlist.user.profileAddress
        })
      }).catch(Error => {
        Response.send({
          success: false,
          message: Error.message
        })
      })
    });
  }

  getPlaylist(Request, Response) {
    Playlist.findOne({
      name: Request.params.name
    }).then(playlist => {
      console.log("SONGS", playlist.songs);
      Response.send({
        success: true,
        playlistName: playlist.name,
        playlistUrl: 'http://musicoin.org/playlist/' + playlist.name,
        creatorName: playlist.user.name,
        creatorUrl: playlist.user.profileAddress ? 'http://musicoin.org/artist/nav/' + playlist.user.profileAddress : null,
        songs: playlist.songs
      });
    }).catch(Error => {
      Response.send({
        success: false,
        message: Error.message
      })
    })
  }

  async getPlaylistWithSongs(Request, Response) {
    try{
      let songs1 = [];
      const playlist = await Playlist.findOne({
        name: Request.params.name
      }).exec();
      const results = await Promise.all(playlist.songs.map(item => {
        return Release.findOne({
          contractAddress: item
        }).populate('artist').exec();
      }));

      songs1 = results.map(track => {
        return {
          title: track.title,
          link: 'https://musicion.org/nav/track/' + track.contractAddress,
          pppLink: track.tx,
          genres: track.genres,
          author: track.artistName,
          authorLink: 'https://musicoin.org/nav/artist/' + track.artistAddress,
          trackImg: track.imageUrl,
          trackDescription: track.description,
          directTipCount: track.directTipCount,
          directPlayCount: track.directPlayCount
        }
      })
      Response.send({
        success: true,
        playlistName: playlist.name,
        playlistUrl: 'http://musicoin.org/playlist/' + playlist.name,
        creatorName: playlist.user.name,
        creatorUrl: playlist.user.profileAddress ? 'http://musicoin.org/artist/nav/' + playlist.user.profileAddress : null,
        songs: songs1
      });
    }catch(error){
      Response.send({
        success: false,
        message: error.message
      })
    }
  }

  deletePlaylist(Request, Response) {
    Playlist.findOne({
      name: Request.params.name
    }).populate('user.userId').then(playlist => {
      if (playlist) {
        playlist.remove();
        Response.send({
          success: true,
          playlistName: playlist.name,
          playlistUrl: 'http://musicoin.org/playlist/' + playlist.name,
          creatorName: playlist.user.name,
          creatorUrl: 'http://musicoin.org/artist/nav/' + playlist.user.profileAddress
        });
      } else {
        Response.status(401);
        Response.send({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    })
  }
  //
}

module.exports = UserController;
