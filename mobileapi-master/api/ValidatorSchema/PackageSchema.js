const PackageCreate = {
  name: {
    type: "string",
    min: 3
  },
  limitApiCalls: {
    type: "number"
  }
};

module.exports = {
  create: PackageCreate
};
