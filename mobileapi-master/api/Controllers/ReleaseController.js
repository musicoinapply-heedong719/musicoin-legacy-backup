/**
 *
 *   MODELS
 *
 * */

const Release = require('../../db/core/release');
const ReleaseStats = require('../../db/core/release-stats');
const TrackMessage = require('../../db/core/track-message');
const Playlist = require('../../db/core/playlist');
const User = require('../../db/core/user');
const TipHistory = require('../../db/core/tip-history');
const ReleaseModel = require('../response-data/release-model');
/**
 *   VALIDATION SCHEMAS
 */
const ReleaseSchema = require('../ValidatorSchema/ReleaseSchema');

/**
 *  LIBS
 *
 * */
const moment = require('moment');
const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const uuidV4 = require('uuid/v4');
const emailUtil = require("../../utils/email");
const renderFile = require("ejs").renderFile;
const path = require("path");
const NOTIFICATION_HTML = path.join(__dirname, "../views/message.ejs");
const TEST_PLAY_HTML = path.join(__dirname, "../views/test-play.ejs");

const UBIMUSIC_ACCOUNT = "0x576b3db6f9df3fe83ea3f6fba9eca8c0ee0e4915";

const renderMessage = function (params, callback) {
  return renderFile(NOTIFICATION_HTML, {
    notification: params
  }, callback);
}

const renderTestPlay = function (params, callback) {
  return renderFile(TEST_PLAY_HTML, {
    response: params
  }, callback);
}

const knownGenres = [
  "Alternative Rock",
  "Ambient",
  "Classical",
  "Country",
  "Dance & EDM",
  "Dancehall",
  "Deep House",
  "Disco",
  "Drum & Bass",
  "Electronic",
  "Folk & Singer-Songwriter",
  "Hip-hop & Rap",
  "House",
  "Indie",
  "Jazz & Blues",
  "Latin",
  "Metal",
  "Piano",
  "Pop",
  "R&B & Soul",
  "Reggae",
  "Reggaeton",
  "Rock",
  "Soundtrack",
  "Techno",
  "Trance",
  "World",
  "Other"
];

const DatePeriodStart = [
  "day",
  "week",
  "month",
  "year",
  "all"
];

let verifiedList = [];

class ReleaseController {

  constructor(ArtistModule, PublishCredentials, PaymentCredentials) {

    this.ArtistModule = ArtistModule;
    this.PublishCredentials = PublishCredentials;
    this.PaymentCredentials = PaymentCredentials;

    this.getUserEmail = this.getUserEmail.bind(this);
    this.updateReleaseStats = this.updateReleaseStats.bind(this);
    this._updateReleaseStats = this._updateReleaseStats.bind(this);
    this.getDatePeriodStart = this.getDatePeriodStart.bind(this);
  }

  limit(limit) {
    if (limit && limit > 0) {
      return limit;
    } else {
      return 10;
    }
  }

  getGenres(Request, Response) {
    console.log("Calling route?")
    Response.send(knownGenres);
  }

  getTrackDetails(Request, Response) {
    Release.findOne({
      contractAddress: Request.params.publicKey
    }).populate('artist').then(track => {

      if (track) {
        Response.send({
          success: true,
          data: {
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
        });
      } else {
        Response.send({
          success: false,
          message: 'Track does not found'
        })
      }

    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      })
    })
  }

  getRandomTrack(Request, Response) {

    let where = {
      state: 'published',
    };
    if (Request.query.genre) {
      if (knownGenres.indexOf(Request.query.genre) !== -1) {
        where.genres = Request.query.genre;
      } else {
        Response.send({
          success: false,
          message: 'This genre is not available'
        });
        return;
      }
    }

    Release.find(where).then(releases => {
      let rand = 0 + Math.random() * (releases.length);
      rand = Math.floor(rand);

      const track = releases[rand];

      if (track) {
        Response.send({
          success: true,
          data: {
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
        });
      } else {
        Response.send({
          success: false,
          message: 'Track does not found'
        })
      }
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      })
    });
  }

  async getRandomTrackV1(Request, Response) {

    let where = {
      markedAsAbuse: {
        $ne: true
      }
    };
    const genre = Request.query.genre;
    if (genre) {
      if (knownGenres.indexOf(genre) !== -1) {
        where.genres = genre;
      } else {
        return Response.status(400).json({
          success: false,
          message: 'This genre is not available'
        });
      }
    }

    try {
      const total = await Release.count(where);
      const randomSkip = Math.floor(Math.random() * total);

      const track = await Release.findOne(where).skip(randomSkip).exec();
      Response.status(200).json({
        success: true,
        data: ReleaseModel.responseData(track)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
  }

  getTrackUpVotes(Request, Response) {
    Release.findOne({
      contractAddress: Request.params.publicKey
    }).populate('artist').then(track => {

      if (track) {
        if (track.votes) {
          Response.send({
            success: true,
            upVotes: track.votes.up
          })
        } else {
          Response.send({
            success: true,
            message: 'There are no votes of this track'
          });
        }
      } else {
        Response.send({
          success: false,
          message: 'Track does not exist'
        });
      }
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  getTrackTips(Request, Response) {
    Release.findOne({
      contractAddress: Request.params.publicKey
    }).then(track => {
      if (track) {
        Response.send({
          success: true,
          totalTips: track.directTipCount
        });
      } else {
        Response.send({
          success: false,
          message: 'Track not found'
        })
      }
    }).catch(Error => {
      Response.send(400, {
        success: false,
        error: Error.message
      });
    });
  }

  getTrackPlays(Request, Response) {
    Release.findOne({
      contractAddress: Request.params.publicKey
    }).then(track => {
      if (track) {
        Response.send(200, {
          success: true,
          plays: track.directPlayCount
        });
      } else {
        Response.send({
          success: false,
          message: 'Track not found'
        });
      }
    }).catch(Error => {
      Response.send(400, {
        success: false,
        error: Error.message
      });
    });
  }

  getTracksByGenre(Request, Response) {

    Release.find({
        genres: Request.query.genre,
        state: 'published',
      })
      .limit(this.limit(Number(Request.query.limit)))
      .then(releases => {
        let ReleasesArray = [];
        for (let track of releases) {
          ReleasesArray.push({
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
          });
        }

        Response.send({
          success: true,
          data: ReleasesArray
        });
      })
      .catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error.message
        });
      })
  }

  async getTracksByGenreV1(Request, Response) {
    const genre = Request.query.genre;
    const limit = this.limit(Number(Request.query.limit));
    const filter = {
      state: 'published',
      markedAsAbuse: {
        $ne: true
      }
    };
    if (genre && knownGenres.indexOf(genre) !== -1) {
      filter.genres = genre;
    } else {
      return Response.status(400).json({
        success: false,
        message: 'This genre is not available'
      });
    }
    try {
      const releases = await Release.find(filter).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
  }

  getTopTracks(Request, Response) {
    Release.find({
        state: 'published',
      })
      .sort({
        directTipCount: 'desc'
      })
      .limit(this.limit(Number(Request.query.limit)))
      .then(releases => {
        let ReleasesArray = [];
        for (let track of releases) {
          ReleasesArray.push({
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
          });
        }

        Response.send({
          success: true,
          data: ReleasesArray
        });
      })
      .catch(Error => {
        Response.send(400, {
          success: false,
          error: Error.message
        })
      });
  }

  async getTopTracksV1(Request, Response) {
    const limit = this.limit(Number(Request.query.limit));
    try {
      const releases = await Release.find({
        state: 'published',
        markedAsAbuse: {
          $ne: true
        }
      }).sort({
        directTipCount: 'desc'
      }).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
  }

  async getTopTracksByGenre(Request, Response) {
    const limit = this.limit(Number(Request.query.limit));
    try {
      const releases = await Release.find({
        state: 'published',
      }).sort({
        directTipCount: 'desc'
      }).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }

  }

  async getTopTracksByGenreV1(Request, Response) {

    const genre = Request.query.genre;
    const limit = this.limit(Number(Request.query.limit));
    const filter = {
      state: 'published',
      markedAsAbuse: {
        $ne: true
      },
    };
    if (genre && knownGenres.indexOf(genre) !== -1) {
      filter.genres = genre;
    } else {
      return Response.status(400).json({
        success: false,
        message: 'This genre is not available'
      });
    }

    try {
      const releases = await Release.find(filter).sort({
        directTipCount: 'desc'
      }).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
  }

  async getRecentTracks(Request, Response) {

    const limit = 20;
    try {
      if (!verifiedList || verifiedList.length === 0) {
        // load verified users
        const _verifiedList = await User.find({
          verified: true,
          profileAddress: {
            $exists: true,
            $ne: null
          }
        }).exec();
        verifiedList = _verifiedList.map(val => val.profileAddress);
      }
      console.log("verifiedList: ",verifiedList.length);

      const releases = await Release.find({
        state: 'published',
        markedAsAbuse: {
          $ne: true
        },
        artistAddress: {
          $in: verifiedList
        }
      }).sort({
        releaseDate: 'desc'
      }).limit(limit).exec();
      const response = ReleaseModel.responseList(releases);

      renderTestPlay(response, (err, html) =>{
        if (html) {
          Response.send(html);
        }else{
          Response.status(500).json({
            error: err.message
          })
        }
      })

    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
  }

  async getRecentTracksV1(Request, Response) {
    const limit = this.limit(Number(Request.query.limit));
    try {
      if (!verifiedList || verifiedList.length === 0) {
        // load verified users
        const _verifiedList = await User.find({
          verified: true,
          profileAddress: {
            $exists: true,
            $ne: null
          }
        }).exec();
        verifiedList = _verifiedList.map(val => val.profileAddress);
      }
      console.log("verifiedList: ",verifiedList.length);

      const releases = await Release.find({
        state: 'published',
        markedAsAbuse: {
          $ne: true
        },
        artistAddress: {
          $in: verifiedList
        }
      }).sort({
        releaseDate: 'desc'
      }).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
  }

  async getTracksByAritstV1(Request, Response) {
    console.log(Request.query);
    const limit = this.limit(Number(Request.query.limit));
    const aritstId = Request.params.address;
    if (!aritstId) {
      return Response.status(400).json({
        error: "artistId is required."
      });
    }
    try {
      const releases = await Release.find({
        artistAddress: aritstId,
        state: 'published',
        markedAsAbuse: {
          $ne: true
        },
      }).sort({
        releaseDate: 'desc'
      }).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
  }

  getUserEmail(user) {
    if (!user) return null;
    if (user.preferredEmail) return user.preferredEmail;
    if (user.local && user.local.email) return user.local.email;
    if (user.google && user.google.email) return user.google.email;
    if (user.facebook && user.facebook.email) return user.facebook.email;
    if (user.twitter && user.twitter.email) return user.twitter.email;
    if (user.invite && user.invite.invitedAs) return user.invite.invitedAs;
    return null;
  }

  async updateReleaseStats(releaseId, amount) {
    const updatePromise = this._updateReleaseStats;
    const now = Date.now();
    return Promise.all(DatePeriodStart.map(duration => {
      return updatePromise(releaseId, now, duration, amount)
    }));
  }

  _updateReleaseStats(releaseId, startDate, duration, amount) {
    const where = {
      release: releaseId,
      startDate: this.getDatePeriodStart(startDate, duration),
      duration
    }

    const updateParams = {
      $inc: {
        tipCount: amount
      }
    }

    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    };
    return ReleaseStats.findOneAndUpdate(
      where,
      updateParams,
      options
    ).exec();
  }

  getDatePeriodStart(startDate, duration) {
    return duration === "all" ? 0 : moment(startDate).startOf(duration);
  }

  tipTrack(Request, Response) {

    const body = {
      tip: Number(Request.body.tip)
    };

    const validate = Validator.validate(body, ReleaseSchema.tip);

    if (validate === true) {
      Release.findOne({
          contractAddress: Request.params.publicKey
        })
        .then(async release => {
          // now we have the release, check tipCount
          if (release) {
            if (!release.directTipCount) {
              release.directTipCount = 0;
            }
            // now before updating the db, we need to call web3 APIs to actually send coins on the blockchain

            release.directTipCount += Number(body.tip);
            release.save();
            const user = await User.findOne({
              "local.email": Request.query.email
            }).exec();
            await TipHistory.create({
              user: user._id,
              release: release._id,
              tipCount: body.tip,
              date: Date.now()
            });
            Response.send({
              success: true,
              tipCount: release.directTipCount
            })
          } else {
            Response.send({
              success: false,
              message: 'This track does not exist'
            });
          }
        })
        .catch(Error => {
          Response.status(400);
          Response.send({
            success: false,
            error: Error.message
          });
        })
    } else {
      Response.status(400);
      Response.send({
        success: false,
        error: validate
      })
    }
  }

  async getRandomTracksV1(Request, Response) {
    try {
      const limit = this.limit(Number(Request.query.limit));
      // use $sample to find the random releases
      const releases = await Release.aggregate([{
        $sample: {
          size: limit
        },
        $match: {
          markedAsAbuse: {
            $ne: true
          }
        }
      }]).exec();

      const tracks = ReleaseModel.responseList(releases);
      Response.send({
        success: true,
        releases: tracks
      });
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
  }
}

module.exports = ReleaseController;
