/**
 * search releases and artists
 * @param {*} parent 
 * @param {*} args 
 * @param {*} context 
 * @param {*} info 
 */
async function search(parent, args, context, info) {
  const Release = context.release;
  const keyword = args.keyword;
  const limit = args.limit;
  const reg = new RegExp(keyword, "i");
  let ReleasesArray = [];
  let ArtistArray = [];

    // search releases
    try {
      const releases = await Release.find({
        $or: [{
            title: {
              $regex: reg
            }
          },
          {
            genres: {
              $regex: reg
            }
          }
        ]
      }).limit(limit).exec();

      // filter the releases and conversion result
      ReleasesArray = releases.filter(release => release !== undefined).map(release => {

        const directTipCount = release.directTipCount || 0;
        const directPlayCount = release.directPlayCount || 0;
        return {
          title: release.title,
          link: 'https://musicion.org/nav/track/' + release.contractAddress,
          pppLink: release.tx,
          genres: release.genres,
          author: release.artistName,
          authorLink: 'https://musicoin.org/nav/artist/' + release.artistAddress,
          trackImg: release.imageUrl,
          trackDescription: release.description,
          directTipCount: directTipCount,
          directPlayCount: directPlayCount
        }
      });
    } catch (error) {
      console.log("search release error:", error.message)
    }

    // search users
    try {
      // search artist from releases
      const users = await Release.aggregate([
        {
          $match: {
            artistName: {
              $regex: reg
            }
          }
        },
        {
          $group: {
            "_id": "$artistAddress",
            "name": {
              $first: "$artistName"
            },
            "profileAddress": {
              $first: "$artistAddress"
            },
            "releaseCount": {
              $sum: 1
            }
          }
        },
        {
          $limit: limit
        }
      ]).exec();

      // conversion result
      ArtistArray = users.map(user => {
        return {
          name: user.name,
          profileAddress: user.profileAddress,
          releaseCount: user.releaseCount
        }
      })
    } catch (error) {
      console.log("search artist error:", error.message)
    }

  return {
    artists: ArtistArray,
    releases: ReleasesArray
  }
}

module.exports = {
  Query: {
    search
  }
}