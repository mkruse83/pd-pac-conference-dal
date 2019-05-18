const dynamoDb = require("./dynamoDB");

const cache = {};

module.exports = (id, sortkey) => {
    const cacheKey = id + '|' + sortkey;
    // cache of three minutes
    if (cache[cacheKey] && new Date().getTime() - cache[cacheKey].date.getTime() < 180000) {
        console.log("INFO: cache hit for ", cacheKey);
        return Promise.resolve(cache[cacheKey].data);
    }

    const params = {
        TableName: "pac-conference",
        KeyConditionExpression: "#uuid = :uuid AND #sortkey = :sortkey",
        ExpressionAttributeNames: {
            "#uuid": "uuid",
            "#sortkey": "sortkey",
        },
        ExpressionAttributeValues: {
            ":uuid": id,
            ":sortkey": sortkey
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
            if (conferences.length > 1) {
                console.log("ERROR:", "incorrect count", conferences);
                reject();
                return;
            }
            cache[cacheKey] = {
                date: new Date(),
                data: conferences[0],
            };
            console.log("INFO: conference", conferences[0]);
            resolve(conferences[0]);
        });
    });
};
