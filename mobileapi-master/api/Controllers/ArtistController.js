// lib
const rp = require('request-promise');
// util
const MediaProvider = require('../../utils/media-provider-instance');
// db table
const LicenseKey = require('../../db/core/key');
const Release = require('../../db/core/release');
const User = require('../../db/core/user');
const Hero = require('../../db/core/hero');
// http response
const ArtistModel = require('../response-data/artist-model');
const ReleaseModel = require('../response-data/release-model');
// constant
const defaultRecords = 20;
const maxRecords = 100;
const Constant = require('../constant');


function getLimit(req) {
  return Math.max(0, Math.min(req.query.limit || defaultRecords, maxRecords));
}

class ArtistController {

  constructor(_artistModule, _credProvider, _accountManager, _publishCredentialsProvider, _hotWalletCredentialsProvider, _contractOwnerAccount) {
    this.artistModule = _artistModule;
    this.publishCredentialsProvider = _publishCredentialsProvider;
    this.hotWalletCredentialsProvider = _hotWalletCredentialsProvider;
    this.accountManager = _accountManager;
    this.contractOwnerAccount = _contractOwnerAccount;
    this.credProvider = _credProvider;
  };

  getProfileByAddress(Request, Response) {
    this.artistModule.getArtistByProfile(Request.params.address).then(res => {
      Response.send(res);
    });
  }

  async getProfileByAddressV1(Request, Response) {
    try {
      const address = Request.params.address;
      const artist = await this.artistModule.getArtistByProfile(address);
      const descUrl = MediaProvider.getIpfsHash(artist.descriptionUrl);
      const desc = await MediaProvider.fetchTextFromIpfs("ipfs://" + descUrl);
      Response.status(200).json({
        ...ArtistModel.responseData(address, artist),
        description: desc
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }

  }

  getNewArtists(Request, Response) {
    this.artistModule.getNewArtists(getLimit(Request)).then(artists => {

      if (artists.length === 0) {
        Response.send({
          success: false,
          message: 'Nothing found'
        });
        return;
      }
      let ResponseInstance = [];

      for (let artist of artists) {
        ResponseInstance.push({
          name: artist.draftProfile.artistName,
          joinDate: artist.joinDate,
          profileLink: 'https://musicoin.org/nav/artist/' + artist.profileAddress
        })
      }

      Response.send({
        success: true,
        data: ResponseInstance
      });
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  getFeaturedArtists(Request, Response) {
    this.artistModule.getFeaturedArtists(getLimit(Request)).then(res => {
      Response.send(res);
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  find(Request, Response) {
    this.artistModule.findArtists(getLimit(Request), Request.query.term).then(res => {
      Response.send(res);
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  profile(Request, Response) {
    const artistModule = this.artistModule;
    this.publishCredentialsProvider.getCredentials()
      .then(function (credentials) {
        console.log("credentials", credentials);
        const releaseRequest = {
          profileAddress: Request.body.profileAddress,
          owner: credentials.account,
          artistName: Request.body.artistName,
          imageUrl: Request.body.imageUrl,
          socialUrl: Request.body.socialUrl,
          descriptionUrl: Request.body.descriptionUrl
        };
        console.log("Got profile POST request: " + JSON.stringify(releaseRequest));
        return artistModule.releaseProfile(releaseRequest)
      }).then(function (tx) {
        Response.send({
          tx: tx
        });
      }).catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error.message
        });
      });
  }

  send(Request, Response) {
    console.log("CALLIGN SEND ROUTE");
    this.artistModule.sendFromProfile(Request.body.profileAddress, Request.body.recipientAddress, Request.body.musicoins)
      .then(function (tx) {
        Response.send({
          tx: tx
        });
      }).catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error.message
        });
      });
  }

  ppp(Request, Response) {
    const context = {};
    this.artistModule.pppFromProfile(Request.body.profileAddress, Request.body.licenseAddress, this.hotWalletCredentialsProvider).then(res => {
      Response.send(res);
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    });


    return LicenseKey.findOne({
        licenseAddress: Request.body.licenseAddress
      }).exec()
      .then(record => {
        if (!record) throw new Error("Key not found for license: " + Request.body.licenseAddress);
        context.key = record.key;

      })
      .then(transactions => {
        context.transactions = transactions;
        Response.send(context);
      }).catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error.message
        });
      });
  }

  async pppV1(Request, Response) {
    try {
      const res = await this.artistModule.pppFromProfile(Request.body.profileAddress, Request.body.licenseAddress, this.hotWalletCredentialsProvider);
      if (res) {
        Response.status(200).json(res)
      } else {
        Response.status(400).json({
          error: "payment rejected."
        })
      }

    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
  }

  getArtistInfo(Request, Response) {
    Release.find({
      artistAddress: Request.params.publicKey
    }).then(releases => {
      if (releases.length > 0) {
        let ResponseInstance = {
          totalTrackTips: 0,
          totalFollowers: 0,
          totalReleases: 0,
          totalPlays: 0,
          releases: []
        };
        for (var i = 0; i < releases.length; i++) {
          ResponseInstance.releases.push(releases[i].contractAddress);
          if (typeof releases[i].directTipCount != 'undefined') {
            ResponseInstance.totalTrackTips += releases[i].directTipCount;
          }
          if (typeof releases[i].directPlayCount != 'undefined') {
            ResponseInstance.totalPlays += releases[i].directPlayCount;
          }
          if (typeof releases[i].directPlayCount != 'undefined') {
            ResponseInstance.totalReleases += 1;
          }
        }
        const artist = User.find({
          profileAddress: Request.params.publicKey
        });
        ResponseInstance.totalFollowers = artist.followerCount;
        Response.send(ResponseInstance);
      } else {
        Response.send({
          success: false,
          error: "No Releases Found"
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  tipArtist(Request, Response) {
    // user should pass their email + pwd to check
    User.findOne({
      profileAddress: Request.body.senderAddress
    }).then(user => {

      console.log("tip user", user);

      if (typeof user != 'undefined') { // we should check whether it matches against the email, pwd combination
        // tip this guy
        console.log("Calling tipArtist endpoint");
        this.artistModule.sendTipFromProfile(Request.body.senderAddress, Request.body.recipientAddress, Request.body.musicoins, this.credProvider)
          .then(function (tx) {
            Response.send({
              tx: tx
            });
          }).catch(Error => {
            Response.status(400);
            Response.send({
              success: false,
              error: Error.message
            });
          });
      }
    })
  }

  getArtistPlays(Request, Response) {
    Release.find({
      artistAddress: Request.params.publicKey
    }).then(releases => {
      if (releases.length > 0) {
        let playsCount = 0;
        for (var i = 0; i < releases.length; i++) {
          if (typeof releases[i].directPlayCount != 'undefined') {
            playsCount += releases[i].directPlayCount;
          }
        }
        Response.send({
          success: true,
          playsCount: playsCount
        });
      } else {
        Response.send({
          success: false,
          error: "No Releases Found"
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  getArtistTips(Request, Response) {
    Release.find({
      artistAddress: Request.params.publicKey
    }).then(releases => {
      let tipCount = 0;
      if (releases.length > 0) {
        for (var i = 0; i < releases.length; i++) {
          if (typeof releases[i].directTipCount != 'undefined') {
            tipCount += releases[i].directTipCount;
            console.log(tipCount)
          }
        }
        Response.send({
          success: true,
          tipCount: tipCount
        });
      } else {
        Response.send({
          success: false,
          error: "No Releases Found"
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  async isArtist(Request, Response) {
    User.findOne({
        profileAddress: {
          $exists: true,
          $ne: null
        }
      })
      .where({
        mostRecentReleaseDate: {
          $exists: true,
          $ne: null
        }
      })
      .where({
        profileAddress: Request.params.publicKey
      })
      .exec()
      .then(user => {
        if (user) {
          Response.send({
            success: true
          });
        } else {
          Response.send({
            success: false
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

  async isArtistVerified(Request, Response) {
    User.findOne({
      profileAddress: Request.params.publicKey
    }).then(user => {
      if (user) {
        Response.send({
          success: true,
          verified: user.verified || false
        });
      } else {
        Response.send({
          success: false,
          message: 'This user does not exist'
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

  getArtistEarnings(Request, Response) {
    Release.find({
      artistAddress: Request.params.publicKey
    }).then(releases => {
      if (releases.length > 0) {
        let ResponseInstance = {
          totalTrackTips: 0,
          totalPlays: 0,
          totalEarnings: 0,
          totalEarningsInUSD: parseFloat("0")
        };
        for (var i = 0; i < releases.length; i++) {
          if (typeof releases[i].directTipCount != 'undefined') {
            ResponseInstance.totalTrackTips += releases[i].directTipCount;
          }
          if (typeof releases[i].directPlayCount != 'undefined') {
            ResponseInstance.totalPlays += releases[i].directPlayCount;
          }
        }
        ResponseInstance.totalEarnings = ResponseInstance.totalTrackTips + ResponseInstance.totalPlays;
        // now call the coinmarketcap api to get the price of musicoin
        const requestOptions = {
          method: 'GET',
          uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=MUSIC',
          headers: {
            'X-CMC_PRO_API_KEY': '95edec13-04cd-4e39-9254-c05634bc1b7f'
          },
          json: true,
          gzip: true
        };

        rp(requestOptions).then(response => {
          console.log('CMC API price of MUSIC:', response.data, response.data.MUSIC.quote.USD.price);
          ResponseInstance.totalEarningsInUSD = ResponseInstance.totalEarnings * parseFloat(response.data.MUSIC.quote.USD.price);
          Response.send(ResponseInstance);
        }).catch((err) => {
          console.log('CMC API call error:', err.message);
          Response.send({
            success: false,
            error: "CMC API Error"
          });
        });
      } else {
        Response.send({
          success: false,
          error: "No Releases Found"
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  getArtistOfWeek(Request, Response) {
    User.find({
        AOWBadge: true,
        profileAddress: {
          $exists: true,
          $ne: null
        }
      })
      .where({
        mostRecentReleaseDate: {
          $exists: true,
          $ne: null
        }
      })
      .exec()
      .then(users => {
        let UsersInstance = [];

        for (let user of users) {
          UsersInstance.push({
            artistName: user.draftProfile.artistName,
            artistAddress: "http://musicoin.org/nav/artist/" + user.profileAddress
          })
        }
        Response.send({
          success: true,
          data: UsersInstance
        });
      }).catch(Error => {
        Response.send({
          success: false,
          error: Error.message
        });
      })
  }

  async getArtistOfWeekV1(Request, Response) {
    try {
      // find the record of week
      const heros = await Hero.find().sort({
        startDate: -1
      }).limit(1).exec();
      const hero = heros ? heros[0] : null;
      if (!hero) {
        return Response.status(400).json({
          error: "not found artist"
        })
      }

      // load release of the record
      const release = await Release.findOne({
        contractAddress: hero.licenseAddress
      }).exec();

      if (!release) {
        return Response.status(400).json({
          error: "not found track"
        })
      }
      const track = ReleaseModel.responseData(release);
      // load artist by address
      const _artist = await this.artistModule.getArtistByProfile(track.artistAddress);

      if(!_artist){
        return Response.status(400).json({
          error: "not found artist"
        })
      }

      const artist = ArtistModel.responseData(track.artistAddress, _artist);

      const data = {
        label: hero.label,
        track,
        artist
      }

      Response.status(200).json(data);
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
  }

}

module.exports = ArtistController;
