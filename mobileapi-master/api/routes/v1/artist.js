const express = require('express');
const Router = express.Router();
const ArtistController = require('../../Controllers/v1/ArtistController');
const Controller = new ArtistController({});

Router.get('/profile/:address', Controller.getProfileByAddress, Controller.sendJson);
Router.post('/tip', Controller.tipArtist, Controller.sendJson);
Router.get('/ofweek', Controller.getArtistOfWeek, Controller.sendJson);
Router.post('/isfollowing', Controller.isFollowing, Controller.sendJson);

module.exports = Router;
