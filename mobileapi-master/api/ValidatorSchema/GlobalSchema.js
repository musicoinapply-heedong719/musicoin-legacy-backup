const search = {
  keyword: {
    type: "string",
    min: 1
  }
}

const reportArtist = {
  reportEmail: {
    type: "email"
  },
  reportType: {
    type: "string"
  },
  reason: {
    type: "string"
  },
  artistAddress: {
    type: "string"
  }
}

const reportRelease = {
  reportEmail: {
    type: "email"
  },
  reportType: {
    type: "string"
  },
  reason: {
    type: "string"
  },
  trackAddress: {
    type: "string"
  }
}

module.exports = {
  search,
  reportArtist,
  reportRelease
}