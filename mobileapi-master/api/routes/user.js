const express = require('express');
const Router = express.Router();
const Kernel = require('../Kernel');

Router.get('/delete/verify/:token', Kernel.userModule.verifyUserAccountDeleting.bind(Kernel.userModule));
Router.get('/ismember', Kernel.userModule.isMember.bind(Kernel.userModule));
Router.get('/info', Kernel.userModule.getUserInfo.bind(Kernel.userModule));
Router.get('/usage/stats', Kernel.userModule.apiGetUsageStats.bind(Kernel.userModule));
Router.get('/playlist/:name', Kernel.userModule.getPlaylist.bind(Kernel.userModule));
Router.get('/plsongs/:name', Kernel.userModule.getPlaylistWithSongs.bind(Kernel.userModule));
Router.get('/balance/:address', Kernel.userModule.getBalance.bind(Kernel.userModule));

Router.post('/renew', Kernel.userModule.renewMember.bind(Kernel.userModule));
Router.post('/delete', Kernel.userModule.generateToken.bind(Kernel.userModule));
Router.post('/playlist', Kernel.userModule.createPlaylist.bind(Kernel.userModule));

Router.delete('/delete', Kernel.userModule.deleteUserAccount.bind(Kernel.userModule));
Router.delete('/playlist/:name', Kernel.userModule.deletePlaylist.bind(Kernel.userModule));

module.exports = Router;
