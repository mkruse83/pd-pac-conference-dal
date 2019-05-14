const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require("aws-sdk"));

AWS.config.apiVersions = {
    dynamodb: "2012-08-10",
};

const dynamoDb = new AWS.DynamoDB();

module.exports = dynamoDb;
