const crypto = require('crypto');

const getHash = (input) => {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
};

module.exports = getHash;
