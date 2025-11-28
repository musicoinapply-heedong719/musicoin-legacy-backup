const signup = {
  username: {
    type: "string",
    min: 3
  },
  password: {
    type: "string",
    min: 6
  },
  email: {
    type: 'email'
  }
};

const socialLogin = {
  channel: {
    type:"string"
  },
  accessToken: {
    type: "string"
  }
}

const quickLogin = {
  password: {
    type: "string",
    min: 6
  },
  email: {
    type: 'email'
  }
};

const authenticate = {
  password: {
    type: "string",
    min: 6
  },
  email: {
    type: 'email'
  }
};

const tokenValidity = {
  email: {
    type: "string"
  },
  accessToken: {
    type: "string",
    length: 80
  }
};

const accessToken = {
  email: {
    type: "string",
    min: 3
  },
  clientSecret: {
    type: "string",
    length: 60
  },
  password: {
    type: "string",
    min: 6
  }
}

module.exports = {
  signup,
  authenticate,
  accessToken,
  tokenValidity,
  quickLogin,
  socialLogin
};
