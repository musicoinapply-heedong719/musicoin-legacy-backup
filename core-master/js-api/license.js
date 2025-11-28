const Release = require('../components/models/release');
const UserPlayback = require('../components/models/user-playback');
const User = require('../components/models/user');
const FormUtils = require('../utils/form-utils')
const bluebird_1 = require("bluebird");

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

function LicenseModule(web3Reader, web3Writer) {
  this.web3Reader = web3Reader;
  this.web3Writer = web3Writer;
};

/**
 * @param {string} address
 * @returns {*|Promise.<TResult>}
 */
LicenseModule.prototype.getLicense = function(address) {
  return this.web3Reader.loadLicense(address)
};

LicenseModule.prototype.getAudioLicense = function(contractAddress) {
  console.log("Getting license: " + contractAddress);
  return Release.findOne({
      contractAddress: contractAddress,
      state: 'published'
    }).exec()
    .then(record => {
      if (record)
        return this.convertDbRecordToLicense(record);
      return null;
    });
}

LicenseModule.prototype.releaseLicense = function(releaseRequest, credentialsProvider) {
  return this.web3Writer.releaseLicense(releaseRequest, credentialsProvider);
};

LicenseModule.prototype.ppp = function(licenseAddress, credentialsProvider) {
  return this.web3Writer.ppp(licenseAddress, credentialsProvider);
};

LicenseModule.prototype.distributeBalance = function(licenseAddress, credentialsProvider) {
  return this.web3Writer.distributeLicenseBalance(licenseAddress, credentialsProvider);
};

LicenseModule.prototype.updatePPPLicense = function(licenseAddress, credentialsProvider) {
  return this.web3Writer.updatePPPLicense(licenseAddress, credentialsProvider);
};

LicenseModule.prototype.getNewReleases = function(limit, genre) {
  const filter = genre ? {
    state: 'published',
    genres: genre,
    markedAsAbuse: {
      $ne: true
    }
  } : {
    state: 'published',
    markedAsAbuse: {
      $ne: true
    }
  };
  return this.getLicensesForEntries(filter, limit);
}

LicenseModule.prototype.getLicensesForEntries = function(condition, limit, sort) {

  return this.getReleaseEntries(condition, limit, sort)
    .then(items => items.map(item => this.convertDbRecordToLicense(item)))
    .then(promises => Promise.all(promises));
}

LicenseModule.prototype.getReleaseEntries = function(condition, limit, _sort) {
  let sort = _sort ? _sort : {
    releaseDate: 'desc'
  };
  let query = Release.find(condition).sort(sort);
  if (limit) {
    query = query.limit(limit);
  }

  return query.exec()
}

LicenseModule.prototype.convertDbRecordToLicense = function(record) {
  if (typeof record.contractAddress == 'undefined') {
    return
  }
  return this.getLicense(record.contractAddress)
    .bind(this)
    .then(function(license) {
      if (!license.artistName)
        license.artistName = record.artistName || 'Musicoin';

      license.genres = record.genres;
      license.languages = record.languages;
      license.moods = record.moods;
      license.regions = record.regions;

      license.description = record.description;
      license.directTipCount = record.directTipCount || 0;
      license.directPlayCount = record.directPlayCount || 0;
      license.releaseDate = record.releaseDate;
      license.tx = record.tx;
      license.markedAsAbuse = record.markedAsAbuse;
      license.pendingUpdateTxs = record.pendingUpdateTxs;
      return license;
    })
}

//LicenseModule.prototype.getRecentPlays = function(limit) {
//  // grab the top 2*n from the db to try to get a distinct list that is long enough.
//  return UserPlayback.find({}).sort({ playbackDate: 'desc' }).limit(limit).exec()
//    .then(records => records.map(r => r.contractAddress))
//    .then(addresses => Array.from(new Set(addresses))) // insertion order is preserved
//    .then(addresses => addresses.map(address => this.getLicense(address)))
//}

LicenseModule.prototype.getTopPlayed = function(limit, genre) {
  const filter = genre ? {
    state: 'published',
    genres: genre
  } : {
    state: 'published'
  };
  return this.getLicensesForEntries(filter, limit, {
      directPlayCount: 'desc'
    })
    .then(function(licenses) {
      // secondary sort based on plays recorded in the blockchain.  This is the number that will
      // show on the screen, but it's too slow to pull all licenses and sort.  So, sort fast with
      // our local db, then resort top results to it doesn't look stupid on the page.
      return licenses.sort((a, b) => {
        const v1 = a.playCount ? a.playCount : 0;
        const v2 = b.playCount ? b.playCount : 0;
        return v2 - v1; // descending
      });
    });
}

LicenseModule.prototype.getLicensesForEntries = function(condition, limit, sort) {
  return this.getReleaseEntries(condition, limit, sort)
    .then(items => items.map(item => this.convertDbRecordToLicense(item)))
    .then(promises => bluebird_1.Promise.all(promises));
}

LicenseModule.prototype.getSampleOfVerifiedTracks = function(limit, genre) {
  // short of upgrading the DB, random selection is a bit difficult.
  // However, we don't really need it to be truly random
  const condition = {
    verified: true,
    mostRecentReleaseDate: {
      $ne: null
    }
  };
  if (!limit || limit < 1 || limit > 10) {
    limit = 1;
  }
  // TODO we could cache the count() result as it doesn't change very often
  return User.find(condition).count()
    .then(count => {
      let offset = count < limit ? 0 : Math.floor(Math.random() * (count - limit));
      return User.find(condition, '_id')
        .limit(limit)
        .skip(offset);
    })
    .then(artists => {
      const filter = genre ? {
        state: 'published',
        genres: genre,
        markedAsAbuse: {
          $ne: true
        }
      } : {
        state: 'published',
        markedAsAbuse: {
          $ne: true
        }
      };
      let query = Release.find(filter)
        .where({
          artist: {
            $in: artists.map(a => a._id)
          }
        })
        .populate("artist");
      return query.exec()
        .then(items => {
          this.shuffle(items);
          const newItems = [];
          const artists = {};
          items.forEach(item => {
            if (!artists[item.artistAddress]) {
              artists[item.artistAddress] = true;
              newItems.unshift(item);
            } else {
              newItems.push(item);
            }
          });
          return newItems.length > limit ? newItems.slice(0, limit) : newItems;
        })
        .then(items => items.map(item => this.convertDbRecordToLicense(item)))
        .then(promises => bluebird_1.Promise.all(promises));
    });
}


LicenseModule.prototype.doGetRandomReleases = function({
  limit = 1,
  genre,
  artist
}) {
  let filter = {
    state: 'published',
    markedAsAbuse: {
      $ne: true
    }
  };
  let queryOptions = null;
  if (genre) {
    queryOptions = Object.assign({}, filter, {
      genre: genre
    });
  }
  if (artist) {
    queryOptions = Object.assign({}, filter, {
      artistAddress: artist
    });
  }
  let query = Release.find(queryOptions).populate('artist');
  return query.exec()
    .then(items => {
      this.shuffle(items);
      return items.length > limit ? items.slice(0, limit) : items;
    })
    .then(items => bluebird_1.Promise.all(items.map(item => this.convertDbRecordToLicense(item))));
}

LicenseModule.prototype.getTrackDetailsByIds = function(addresses) {
  return Release.find({
      contractAddress: {
        $in: addresses
      }
    })
    .populate('artist')
    .then(releases => {
      return bluebird_1.Promise.all(releases.map(r => this.convertDbRecordToLicenseLite(r)));
    })
}

LicenseModule.prototype.convertDbRecordToLicenseLite = function(record) {
  const draftProfile = record.artist && record.artist.draftProfile ? record.artist.draftProfile : null;
  return {
    artistName: record.artistName,
    genres: record.genres,
    languages: record.languages,
    moods: record.moods,
    regions: record.regions,
    description: record.description,
    directTipCount: record.directTipCount || 0,
    directPlayCount: record.directPlayCount || 0,
    artistProfileAddress: record.artistAddress,
    title: record.title,
    address: record.contractAddress,
    tx: record.tx,
    artist: {
      artistName: draftProfile ? draftProfile.artistName : "",
      verified: record.artist && record.artist.verified
    }
  };
}

LicenseModule.prototype.shuffle = function(a) {
  for (let i = a.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }

}

function sanitize(s) {
  const s1 = FormUtils.defaultString(s, "");
  return s1 ? s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").trim() : s1;
}

LicenseModule.prototype.getNewReleasesByGenre = function(limit, maxGroupSize, _search, _genre, _sort) {
  const search = sanitize(_search);
  const genre = _genre;
  const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
  const sort = _sort == "plays" ? [
      ["directPlayCount", 'desc'],
      ["directTipCount", 'desc'],
      ["releaseDate", 'desc']
    ] :
    _sort == "date" ? [
      ["releaseDate", 'desc'],
      ["directTipCount", 'desc'],
      ["directPlayCount", 'desc']
    ] : [
      ["directTipCount", 'desc'],
      ["directPlayCount", 'desc'],
      ["releaseDate", 'desc']
    ];
  const artistList = search ?
    User.find({
      "draftProfile.artistName": {
        "$regex": search,
        "$options": "i"
      }
    })
    .where({
      mostRecentReleaseDate: {
        $ne: null
      }
    })
    .exec()
    .then(records => records.map(r => r.profileAddress)) :
    bluebird_1.Promise.resolve([]);
  return artistList
    .then(profiles => {
      let releaseQuery = Release.find({
        state: "published",
        markedAsAbuse: {
          $ne: true
        }
      });
      if (search) {
        releaseQuery = releaseQuery.where({
          $or: [{
              artistAddress: {
                $in: profiles
              }
            },
            {
              title: {
                "$regex": search,
                "$options": "i"
              }
            },
            {
              genres: {
                "$regex": search,
                "$options": "i"
              }
            },
            {
              languages: {
                "$regex": search,
                "$options": "i"
              }
            },
            {
              moods: {
                "$regex": search,
                "$options": "i"
              }
            },
            {
              regions: {
                "$regex": search,
                "$options": "i"
              }
            }
          ]
        });
      }
      if (genre) {
        releaseQuery = releaseQuery.where({
          "genres": genre
        });
      }
      return releaseQuery
        .sort(sort)
        .exec()
        .then(items => {
          const genreOrder = [];
          const genreItems = {};
          let itemsIncluded = 0;
          for (let i = 0; i < items.length && itemsIncluded < limit; i++) {
            const item = items[i];
            const itemGenres = item.genres.slice(0);
            itemGenres.push("Other");
            for (let g = 0; g < itemGenres.length; g++) {
              const genre = itemGenres[g];
              if (knownGenres.indexOf(genre) == -1)
                continue;
              if (genreOrder.indexOf(genre) == -1) {
                genreOrder.push(genre);
                genreItems[genre] = [];
              }
              if (genreItems[genre].length < maxGroupSize) {
                item.genres = genre;
                genreItems[genre].push(item);
                itemsIncluded++;
                break;
              }
            }
          }
          return flatten(genreOrder.map(g => genreItems[g]));
        })
        .then(items => items.map(item => this.convertDbRecordToLicenseLite(item)))
        .then(promises => bluebird_1.Promise.all(promises));
    });
}


LicenseModule.prototype.getWeb3Reader = function() {
  return this.web3Reader;
};

module.exports = LicenseModule;
