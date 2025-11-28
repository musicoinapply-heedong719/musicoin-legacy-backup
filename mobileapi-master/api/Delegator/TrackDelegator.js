const ControllerDelegator = require('./ControllerDelegator');
const request = require('request');
const CLIENT_ID = "OLDjonAeYPx6ZVKaMD3a";

class TrackDelegator extends ControllerDelegator {

  constructor(props){
    super(props);

    this.getLicenseKey = this.getLicenseKey.bind(this);
    this.loadLicense = this.loadLicense.bind(this);
    this.increaseTrackPlays = this.increaseTrackPlays.bind(this);
    this.increaseTrackPlayStats = this.increaseTrackPlayStats.bind(this);
  }

  getLicenseKey(licenseAddress) {
    const licenseUrl = `${process.env.CORE_API_URL}/${licenseAddress}`;
    console.log("getLicenseKey:"+licenseUrl);
    return new Promise((resolve, reject)=>{
      request({
        url: `${process.env.CORE_API_URL}/${licenseAddress}`,
        json: true,
        headers: {
          clientID: CLIENT_ID
        }
      }, function (error, response, result) {
        if (error) {
          reject(error);
        }else if (response.statusCode != 200) {
          reject("not found");
        }else{
          resolve(result);
        }
      })
    })
  }

  loadLicense(licenseAddress){
    return this.MusicoinCore.getLicenseModule().getLicense(licenseAddress);
  }

  increaseTrackPlays(address){
    return this.db.Release.update({contractAddress:address}, {$inc: { directPlayCount: 1 }})
  }

  increaseTrackPlayStats(releaseId){
    const updatePromise = this.updatePlayStats;
    const now = Date.now();
    const ReleaseStats = this.db.ReleaseStats;
    return Promise.all(this.constant.DATE_PERIOD.map(duration => {
      const where = {
        release: releaseId,
        startDate: this.getDatePeriodStart(now, duration),
        duration
      }
      return updatePromise(ReleaseStats, where, 1);
    }));
  }

}

module.exports = TrackDelegator;
