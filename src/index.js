require("aws-xray-sdk");

const AddConferenceHandler = require("./handler/AddConferenceHandler");
const ConferenceHandler = require("./handler/GetConferencesHandler");

const AWS = require('aws-sdk');
AWS.config.apiVersions = {
  dynamodb: '2012-08-10',
};


exports.handler = async (event, context) => {
  console.log(
    "START pd-pac-conference-dal; event:",
    JSON.stringify(event, null, 2),
    "context: ",
    JSON.stringify(context, null, 2)
  );

  const handlers = [
      new AddConferenceHandler(),
      new ConferenceHandler(),
  ];

  const dynamoDb = new AWS.DynamoDB();
  const foundHandler = handlers.find(handler => handler.canHandle(event, context));
  if (foundHandler) {
    return foundHandler.handle(event, context, dynamoDb);
  }
  console.log("WARNING:", "could not handle");
  return {};
};
