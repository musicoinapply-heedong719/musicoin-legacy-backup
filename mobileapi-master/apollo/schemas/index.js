const path = require('path');
const {
  fileLoader,
  mergeTypes
} = require('merge-graphql-schemas');

const schemaArray = fileLoader(path.join(__dirname, './*.graphql'))
console.log(schemaArray);
module.exports = mergeTypes(schemaArray, { all: true })