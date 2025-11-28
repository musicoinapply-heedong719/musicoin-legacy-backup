const TOKEN_TIMEOUT = 7 * 24 * 60 * 60 * 1000;
const TOKEN_LENGTH = 40;
const SECRET_LENGTH = 30;
const IPFS_PROTOCOL = "ipfs://";
const IPFS_BASE_URL = "https://musicoin.org/media/";
const TRACK_BASE_URL = "https://musicoin.org/nav/track/";
const ARTIST_BASE_URL = "https://musicoin.org/nav/artist/";
const PLAY_BASE_URL = "https://a.musicoin.org/track";
const UBIMUSIC_ACCOUNT = "0x576b3db6f9df3fe83ea3f6fba9eca8c0ee0e4915";

const DATE_PERIOD = [
  "day",
  "week",
  "month",
  "year",
  "all"
];

const GENRES = [
  "Alternative Rock",
  "Ambient",
  "Classical",
  "Country",
  "Dance & EDM",
  "Dancehall",
  "Deep House",
  "Disco",
  "Drum & Bass",
  "Electronic",
  "Folk & Singer-Songwriter",
  "Hip-hop & Rap",
  "House",
  "Indie",
  "Jazz & Blues",
  "Latin",
  "Metal",
  "Piano",
  "Pop",
  "R&B & Soul",
  "Reggae",
  "Reggaeton",
  "Rock",
  "Soundtrack",
  "Techno",
  "Trance",
  "World",
  "Other"
];

SOCIAL_CHANNELS = [
  "google",
  "twitter",
  "facebook"
]


module.exports = {
  TOKEN_TIMEOUT,
  IPFS_BASE_URL,
  TRACK_BASE_URL,
  ARTIST_BASE_URL,
  IPFS_PROTOCOL,
  PLAY_BASE_URL,
  TOKEN_LENGTH,
  SECRET_LENGTH,
  UBIMUSIC_ACCOUNT,
  DATE_PERIOD,
  GENRES,
  SOCIAL_CHANNELS
}