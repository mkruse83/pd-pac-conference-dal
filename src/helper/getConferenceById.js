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
        Key: {
            uuid: id,
            sortkey: sortkey,
        }
    };

    return new Promise((resolve, reject) => {
        dynamoDb.get(params, function (err, data) {
            if (err) {
                console.log("ERROR:", err, err.stack);
                reject(err);
                return;
            }
            console.log("SUCCESS:", data);
            const conference = data.Item;
            cache[cacheKey] = {
                date: new Date(),
                data: conference,
            };
            console.log("INFO: conference", conference);
            resolve(conference);
        });
    });
};
