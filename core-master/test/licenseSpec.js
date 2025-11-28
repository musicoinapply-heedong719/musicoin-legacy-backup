const assert = require('assert');
const Promise = require('bluebird');
const LicenseModule = require("../js-api/license");

describe('License', function() {
  describe('Success cases', function() {
    it('should release a license', function () {
      const input = {
        title: "Title",
        resourceUrl: "resourceUrl",
        imageUrl: "imageUrl",
        metadataUrl: "textUrl"
      };
      const expectedRequest = {
        title: "Title",
        resourceUrl: "resourceUrl",
        imageUrl: "imageUrl",
        metadataUrl: "textUrl"
      };
      const web3Reader = {};
      const credentialsProvider = {};
      const web3Writer = {
        releaseLicense: (request, credsProvider) => {
          assert.equal(expectedRequest.title, request.title);
          assert.equal(expectedRequest.resourceUrl, request.resourceUrl);
          assert.equal(expectedRequest.imageUrl, request.imageUrl);
          assert.equal(expectedRequest.metadataUrl, request.metadataUrl);
          assert.strictEqual(credentialsProvider, credsProvider, "Unexpected credentials provider");
          return Promise.resolve("tx")
        }
      };
      const mediaProvider = {
        upload: (data, provider) => {
          if (data == input.audioResource) return Promise.resolve(expectedRequest.resourceUrl);
          if (data == input.imageResource) return Promise.resolve(expectedRequest.imageUrl);
          throw new Error("Unexpected input");
        },
        uploadText: data => Promise.resolve(expectedRequest.metadataUrl)
      };
      const licenseModule = new LicenseModule(web3Reader, web3Writer, mediaProvider);
      return licenseModule.releaseLicense(input, credentialsProvider)
        .then(function (result) {
          assert.equal(result, "tx", "Did not return the expected tx");
        })
    })
  });
});