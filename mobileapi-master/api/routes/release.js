const express = require('express');
const Router = express.Router();
const {
  releaseModule
} = require('../Kernel');

Router.get('/genres', releaseModule.getGenres.bind(releaseModule));
Router.get('/details/:publicKey', releaseModule.getTrackDetails.bind(releaseModule));
Router.get('/random', releaseModule.getRandomTrack.bind(releaseModule));
Router.get('/upvotes/:publicKey', releaseModule.getTrackUpVotes.bind(releaseModule));
Router.get('/plays/:publicKey', releaseModule.getTrackPlays.bind(releaseModule));
Router.get('/tips/:publicKey', releaseModule.getTrackTips.bind(releaseModule));
Router.get('/bygenre', releaseModule.getTracksByGenre.bind(releaseModule));
Router.get('/top', releaseModule.getTopTracks.bind(releaseModule));
Router.get('/topbygenre', releaseModule.getTopTracksByGenre.bind(releaseModule));
Router.get('/recent', releaseModule.getRecentTracks.bind(releaseModule));

Router.get('/random/v1', releaseModule.getRandomTrackV1.bind(releaseModule));
Router.get('/randoms/v1', releaseModule.getRandomTracksV1.bind(releaseModule));
Router.get('/bygenre/v1', releaseModule.getTracksByGenreV1.bind(releaseModule));
Router.get('/top/v1', releaseModule.getTopTracksV1.bind(releaseModule));
Router.get('/topbygenre/v1', releaseModule.getTopTracksByGenreV1.bind(releaseModule));
Router.get('/recent/v1', releaseModule.getRecentTracksV1.bind(releaseModule));
Router.get('/byartist/v1/:address', releaseModule.getTracksByAritstV1.bind(releaseModule));

Router.post('/tip/:publicKey', releaseModule.tipTrack.bind(releaseModule));

module.exports = Router;
