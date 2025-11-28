
const ReleaseModel = require('./release-model');

function responseData(data) {
  return {
    name:data.name,
    release: ReleaseModel.responseData(data.release)
  }
}

function responseList(data) {
  return data.map(responseData);
}

module.exports = {
  responseData,
  responseList
}