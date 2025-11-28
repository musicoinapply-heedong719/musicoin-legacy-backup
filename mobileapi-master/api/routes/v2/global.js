const express = require('express');
const Router = express.Router();
const GlobalController = require('../../Controllers/v2/GlobalController');
const Controller = new GlobalController();

Router.get('/search', Controller.search, Controller.sendJson);
module.exports = Router;