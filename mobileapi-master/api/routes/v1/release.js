const express = require('express');
const Router = express.Router();
const ReleaseController = require('../../Controllers/v1/ReleaseController');
const Controller = new ReleaseController();

Router.get('/detail/:address', Controller.getTrackDetail, Controller.sendJson);
Router.get('/recent',Controller.getRecentTracks, Controller.sendJson);
Router.get('/bygenre', Controller.getTracksByGenre, Controller.sendJson);
Router.get('/byartist', Controller.getTracksByArtist, Controller.sendJson);
Router.post('/tip', Controller.tipTrack, Controller.sendJson);
Router.post('/isliked', Controller.isLiked, Controller.sendJson);

module.exports = Router;
