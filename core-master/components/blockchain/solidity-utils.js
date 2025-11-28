const fs = require('fs');

const loadContractDefinition = function(sha3, definitionFile) {
  const params = JSON.parse(fs.readFileSync(definitionFile));
  const code = "0x" + fs.readFileSync(__dirname + "/../../" + params.codeFile);
  const abi = JSON.parse(fs.readFileSync(__dirname + "/../../" + params.abiFile));
  params.constructorArgs = params.constructorArgs ? params.constructorArgs : _extractConstructorArgs(abi);
  const output = Object.assign({}, params, {
    code: code,
    codeHash: sha3(code),
    codeLength: code.length,
    abi: abi
  });
  return Object.freeze(output);
};

const _extractConstructorArgs = function(abi) {
  const constructors = abi.filter(f => f.type && f.type == "constructor");
  if (constructors.length == 1 && constructors[0].inputs) {
    return constructors[0].inputs.map(input => _removeUnderscore(input.name));
  }
  throw new Error("Multiple constructors found!")
};

const _removeUnderscore = function(s) {
  if (s.startsWith("_"))
    return s.substr(1);
  return s;
};


module.exports.loadContractDefinition = loadContractDefinition;
module.exports.extractConstructorParams = _extractConstructorArgs;