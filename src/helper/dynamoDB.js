let AWS;
if (process.env.PD_PAC_ENVIRONMENT !== 'local') {
    const AWSXRay = require('aws-xray-sdk');
    AWS = AWSXRay.captureAWS(require("aws-sdk"));

} else {
    AWS = require("aws-sdk");
}

AWS.config.apiVersions = {
    dynamodb: "2012-08-10",
};

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = dynamoDb;
