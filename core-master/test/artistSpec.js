var assert = require('assert');
const Promise = require('bluebird');
const ArtistModule = require("../js-api/artist");

describe('Artist', function() {
  const mockProfile = {
    descriptionUrl: "descriptionUrl",
    socialUrl: "socialUrl",
    imageUrl: "imageUrl",
  };

  const expected = Object.assign({
    descriptionUrl: "descriptionUrl",
    socialUrl: "socialUrl",
    imageUrl: "imageUrl",
  }, mockProfile);

  const profilesByArist = {};
  const profiles = {};
  const artist1Addr = "artist1";
  const artist1ProfileAddr = "profile1";
  profilesByArist[artist1Addr] = mockProfile;
  profiles[artist1ProfileAddr] = mockProfile;

  const web3Reader = {
    getArtistByProfile: (address) => Promise.resolve(profiles[address]),
  };

  const emptyWeb3Writer = {};

  const musicoinUrl = "http://something";


  it('getArtistByProfile should return for profile 1', function() {
    const artist = new ArtistModule(web3Reader, emptyWeb3Writer);
    return artist.getArtistByProfile(artist1ProfileAddr)
      .then(function(result) {
        assert.deepEqual(result, expected, "Profile is not as expected");
      })
  });

  it('should release a profile', function () {
    const input = {
      artistName: "Artist",
      descriptionUrl: "resourceUrl",
      imageUrl: "imageUrl",
      socialUrl: "socialUrl"
    };
    const expectedRequest = {
      artistName: "Artist",
      descriptionUrl: "resourceUrl",
      imageUrl: "imageUrl",
      socialUrl: "socialUrl"
    };
    const web3Reader = {};
    const credentialsProvider = {};
    const web3Writer = {
      releaseArtistProfile: (request, credsProvider) => {
        assert.equal(expectedRequest.artistName, request.artistName);
        assert.equal(expectedRequest.descriptionUrl, request.descriptionUrl);
        assert.equal(expectedRequest.imageUrl, request.imageUrl);
        assert.equal(expectedRequest.socialUrl, request.socialUrl);
        assert.strictEqual(credentialsProvider, credsProvider, "Unexpected credentials provider");
        return Promise.resolve("tx")
      }
    };
    const artistModule = new ArtistModule(web3Reader, web3Writer);
    return artistModule.releaseProfile(input, credentialsProvider)
      .then(function (result) {
        assert.equal(result, "tx", "Did not return the expected tx");
      })
  })
});

const override = function(src, overrides) {
  return Object.assign({}, src, overrides);
};