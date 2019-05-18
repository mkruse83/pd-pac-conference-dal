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
        KeyConditionExpression: "#id = :month",
        ExpressionAttributeNames: {
            "#id": "uuid"
        },
        ExpressionAttributeValues: {
            ":month": "conference-" + yearAndMonth,
        }
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
