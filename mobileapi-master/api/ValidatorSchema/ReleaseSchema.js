const tip = {
  musicoins: {
    type: "number",
    min: 1
  },
  trackAddress: {
    type: "string"
  }
};

const byGenre = {
  genre: {
    type: "string"
  },
  limit: {
    type: "number",
    min: 1
  }
}

const byArtist = {
  artistAddress: {
    type: "string"
  },
  limit: {
    type: "number",
    min: 1
  }
}

module.exports = {
  tip,
  byGenre,
  byArtist
};
