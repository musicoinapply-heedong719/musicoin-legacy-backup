const express = require('express');
const Router = express.Router();
const ReleaseController = require('../../Controllers/v2/ReleaseController');
const Controller = new ReleaseController();

Router.post('/tip', Controller.tipTrack, Controller.sendJson);

module.exports = Router;
