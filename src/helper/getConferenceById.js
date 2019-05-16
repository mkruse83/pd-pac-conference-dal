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
            ":uuid": {
                S: id
            },
            ":sortkey": {
                S: sortkey
            }
        }
    };

    return new Promise((resolve, reject) => {
        dynamoDb.query(params, function (err, data) {
            if (err) {
                console.log("ERROR:", err, err.stack);
                reject(err);
                return;
            }
            if (data.Items.length > 1) {
                console.log("ERROR:", "incorrect count", data)
                reject();
                return;
            }
            console.log("SUCCESS:", data);
            const conferences = data.Items.map(item => ({
                id: item.uuid.S + "|" + item.sortkey.S,
                name: item.name.S,
                from: new Date(Number.parseInt(item.from.N)),
                to: new Date(Number.parseInt(item.to.N)),
                topics: item.topics.L.map(topic => topic.S),
                location: {
                    name: item.location.M.name.S,
                    address: item.location.M.address.S,
                },
                talks: item.talks.L.map((talk) => ({
                    from: new Date(Number.parseInt(talk.M.from.N)),
                    to: new Date(Number.parseInt(talk.M.to.N)),
                    name: talk.M.name.S,
                    room: {
                        name: talk.M.room.M.name.S,
                        nameInLocation: talk.M.room.M.nameInLocation.S,
                    },
                    speaker: {
                        company: talk.M.speaker.M.company.S,
                        name: talk.M.speaker.M.name.S,
                        title: talk.M.speaker.M.title.S,
                    },
                    topics: talk.M.topics.L.map(topic => topic.S),
                }))
            }));
            cache[cacheKey] = {
                date: new Date(),
                data: conferences[0],
            };
            console.log("INFO: conference", conferences[0]);
            resolve(conferences[0]);
        });
    });
};
