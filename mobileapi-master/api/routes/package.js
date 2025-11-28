const express = require('express');
const Router = express.Router();
const Kernel = require('../Kernel');

Router.get('/list', Kernel.packageModule.getAll.bind(Kernel.packageModule));

Router.post('/create', Kernel.packageModule.create.bind(Kernel.packageModule));

module.exports = Router;
