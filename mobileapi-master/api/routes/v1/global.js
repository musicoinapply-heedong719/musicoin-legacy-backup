const express = require('express');
const Router = express.Router();
const GlobalController = require('../../Controllers/v1/GlobalController');
const Controller = new GlobalController();

const checkReportArtist = Controller.checkParams(Controller.schema.GlobalSchema.reportArtist);
const checkReportRelease = Controller.checkParams(Controller.schema.GlobalSchema.reportRelease);

Router.post('/search', Controller.search, Controller.sendJson);
Router.post('/report/release', checkReportRelease,Controller.reportRelease, Controller.sendJson);
Router.post('/report/artist', checkReportArtist,Controller.reportArtist, Controller.sendJson);
Router.post("/apple/iap", Controller.appleIAP, Controller.sendJson);
Router.post("/google/iap", Controller.googleIAP, Controller.sendJson);
Router.post("/del/receipt", Controller.delReceipt, Controller.sendJson);

Router.get("/check_services", Controller.checkServices, Controller.sendJson);
Router.get("/hello", Controller.hello, Controller.sendJson);
Router.get("/analytics", Controller.analytics, Controller.sendJson);
// apple iap

module.exports = Router;
