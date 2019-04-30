const data = require("./data.json");

exports.handler = (event, context, callback) => {
  callback(null, data);
};
