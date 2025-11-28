const MediaProvider = require('../../utils/media-provider-instance');

function responseData(address, artist) {
  return {
    profileAddress: address,
    createdBy: artist.createdBy,
    forwardingAddress: artist.forwardingAddress,
    descriptionHash: MediaProvider.getIpfsHash(artist.descriptionUrl),
    artistName: artist.artistName,
    owner: artist.owner,
    contractVersion: artist.contractVersion,
    imageUrl: MediaProvider.resolveIpfsUrl(artist.imageUrl),
    socialUrl: MediaProvider.resolveIpfsUrl(artist.socialUrl),
    followers: artist.followers || 0,
    tipTotal: artist.tipTotal || 0,
    tipCount: artist.tipCount || 0,
    balance: artist.balance || 0
  }
}

function responseList(address, artists) {
  return artists.filter(artist => artist !== undefined).map(artist=>responseData(address, artist));
}

module.exports = {
  responseData,
  responseList
}