const express = require('express');
const Router = express.Router();
const sendSeekable = require('send-seekable');
const TrackController = require('../../Controllers/v1/TrackController');
const Controller = new TrackController();

Router.get('/download/:address', sendSeekable, Controller.downloadTrack, Controller.sendStream);

module.exports = Router;