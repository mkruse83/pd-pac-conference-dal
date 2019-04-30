require("aws-xray-sdk");
const data = require("./data.json");

exports.handler = async (event, context) => {
  console.log(
    "START pd-pac-conference-dal; event:",
    JSON.stringify(event, null, 2),
    "context: ",
    JSON.stringify(context, null, 2)
  );

  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(data)
  };
};
