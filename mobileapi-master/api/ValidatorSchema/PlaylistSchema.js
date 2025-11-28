const add = {
  name: {
    type: "string",
  },
  email: {
    type: "email"
  },
  trackAddress: {
    type: "string",
  }
}

const getOne = {
  name: {
    type: "string",
  },
  email: {
    type: "email"
  }
}

const getAll = {
  email: {
    type: "email"
  }
}

const deleteOne = {
  name: {
    type: "string",
  },
  email: {
    type: "email"
  },
  trackAddress: {
    type: "string",
  }
}

module.exports = {
  add,
  getOne,
  getAll,
  deleteOne
};
