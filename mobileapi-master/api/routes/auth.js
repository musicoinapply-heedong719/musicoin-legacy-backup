const express = require('express');
const Router = express.Router();
const Kernel = require('../Kernel');

Router.post('/signup', Kernel.authModule.registerNewUser.bind(Kernel.authModule)); // signup using email + password
Router.post('/clientsecret', Kernel.authModule.getAPICredentials.bind(Kernel.userModule)); // get clientSecret taking in email + password
Router.post('/verify', Kernel.authModule.authenticateUser.bind(Kernel.userModule)); // verify user email + password
Router.post('/authtoken', Kernel.authModule.genTokenTest.bind(Kernel.userModule)); // gen access token
Router.post('/timeout', Kernel.authModule.getTokenValidity.bind(Kernel.userModule)); // get token timeout

module.exports = Router;
