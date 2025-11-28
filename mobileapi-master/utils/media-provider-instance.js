const MediaProvider = require('./media-provider');
const IPFS_READ_ENDPOINT = process.env.IPFS_READ_ENDPOINT || "http://localhost:8080";
const IPFS_ADD_ENDPOINT = process.env.IPFS_ADD_ENDPOINT || "http://localhost:5001";
const instance = new MediaProvider(IPFS_READ_ENDPOINT,IPFS_ADD_ENDPOINT+"/api/v0/add");

module.exports = instance;