const MusicoinCore = require("../modules/coreModule");
const ConfigUtils = require('../config/config');

const config = ConfigUtils.loadConfig(process.argv);
const contractOwnerAccount = config.contractOwnerAccount; // this is the credentials provider to deal with unlocking and locking accounts
const musicoinCore = new MusicoinCore(config);
musicoinCore.setCredentials(config.publishingAccount, config.publishingAccountPassword); // dumb?

const Web3Writer = require('../modules/blockchain/web3-writer');
const AccountManager = require("../modules/accountManager");
const accountManager = new AccountManager();
const ArtistController = require('./Controllers/ArtistController');
const LicenseController = require('./Controllers/LicenseController');
const TxController = require('./Controllers/TxController');
const UserController = require('./Controllers/UserController');
const GlobalController = require('./Controllers/GlobalController');
const packageModule = require('./Controllers/PackageController');
const authModule = require('./Controllers/AuthController');
const ReleaseController = require('./Controllers/ReleaseController');

const publishCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.publishingAccount, config.publishingAccountPassword);
const paymentAccountCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.paymentAccount, config.paymentAccountPassword);
const licenseModule = new LicenseController(musicoinCore.getLicenseModule(), accountManager, publishCredentialsProvider, paymentAccountCredentialsProvider, contractOwnerAccount);
//const temp = musicoinCore.getCredentials();
//const artistModule = new ArtistController(musicoinCore.getArtistModule(), musicoinCore.getCredentials1(), accountManager, publishCredentialsProvider, paymentAccountCredentialsProvider);
const artistModule = new ArtistController(musicoinCore.getArtistModule(), paymentAccountCredentialsProvider, accountManager, publishCredentialsProvider, paymentAccountCredentialsProvider);
const txModule = new TxController(musicoinCore.getTxModule(), config.orbiterEndpoint, musicoinCore.getWeb3Reader());
const UserModule = new UserController(musicoinCore.getWeb3Reader(), config);
const GlobalModule = new GlobalController(musicoinCore.getArtistModule());
const ReleaseModule = new ReleaseController(musicoinCore.getArtistModule(), publishCredentialsProvider, paymentAccountCredentialsProvider);

module.exports = {
  licenseModule: licenseModule,
  artistModule: artistModule,
  txModule: txModule,
  packageModule: packageModule,
  authModule: authModule,
  releaseModule: ReleaseModule,
  userModule: UserModule,
  globalController: GlobalModule,
  musicoinCore,
  publishCredentialsProvider,
  paymentAccountCredentialsProvider
};
