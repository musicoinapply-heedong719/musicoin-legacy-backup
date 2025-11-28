const express = require('express');
const Router = express.Router();
const Kernel = require('../Kernel');

Router.post('/search', Kernel.globalController.search.bind(Kernel.globalController));
Router.post('/search/v1', Kernel.globalController.searchV1.bind(Kernel.globalController));
Router.post('/getsongsbya', Kernel.globalController.getAllSongs.bind(Kernel.globalController));
Router.post('/getsongsbyn', Kernel.globalController.getAllSongsByName.bind(Kernel.globalController));
Router.post('/release/publish', Kernel.globalController.publishRelease.bind(Kernel.globalController));

module.exports = Router;
