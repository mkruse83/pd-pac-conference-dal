const {
    ID,
    SORT,
    TOPICS,
} = require("../helper/fields");
const dynamoDb = require("./dynamoDB");

const cache = {};

module.exports = (yearAndMonth) => {
    // cache of three minutes
    if (cache[yearAndMonth] && new Date().getTime() - cache[yearAndMonth].date.getTime() < 180000) {
        console.log("INFO: cache hit for ", yearAndMonth);
        return Promise.resolve(cache[yearAndMonth].data);
    }

    const params = {
        TableName: "pac-conference",
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: {
            "#id": ID,
            "#sortkey": SORT,
            "#name": "name",
            "#from": "from",
            "#to": "to",
            "#topics": TOPICS,
            "#location": "location",
        },
        ExpressionAttributeValues: {
            ":id": "conference#" + yearAndMonth,
        },
        Select: "SPECIFIC_ATTRIBUTES",
        ProjectionExpression: "#id, #sortkey, #from, #to, #name, #topics, #location"

    };

    return new Promise((resolve, reject) => {
        dynamoDb.query(params, function (err, data) {
            if (err) {
                console.log("ERROR:", err, err.stack);
                reject(err);
                return;
            }
            console.log("SUCCESS:", data);
            const conferences = data.Items;
            cache[yearAndMonth] = {
                date: new Date(),
                data: conferences,
            };
            console.log("INFO: conferences", conferences);
            resolve(conferences);
        });
    });
};
