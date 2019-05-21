const {GET_TALKS_BY_TOPIC} = require("../helper/methods");
const {
    ID,
    TOPICS,
} = require("../helper/fields");
const dynamoDb = require("../helper/dynamoDB");

const cache = {};

class GetTopicsByMonth {

    canHandle(event) {
        return event.identifier === GET_TALKS_BY_TOPIC;
    }

    handle(event) {
        const topic = event.topic;
        const yearAndMonth = event.yearAndMonth;
        try {
            this.validate(topic, yearAndMonth);
        } catch (e) {
            return Promise.reject(e);
        }

        const cacheKey = yearAndMonth + '#' + topic;
        // cache of three minutes
        if (cache[cacheKey] && new Date().getTime() - cache[cacheKey].date.getTime() < 180000) {
            console.log("INFO: cache hit for ", cacheKey);
            return Promise.resolve(cache[cacheKey].data);
        }

        const params = {
            TableName: "pac-conference",
            KeyConditionExpression: "#id = :id",
            FilterExpression: "contains (#topics, :topic)",
            ExpressionAttributeNames: {
                "#id": ID,
                "#topics": TOPICS,
            },
            ExpressionAttributeValues: {
                ":id": "talk#" + yearAndMonth,
                ":topic": topic,
            },
        };

        return new Promise((resolve, reject) => {
            dynamoDb.query(params, function (err, data) {
                if (err) {
                    console.log("ERROR:", err, err.stack);
                    reject(err);
                    return;
                }
                console.log("SUCCESS:", data);
                const talks = data.Items;

                cache[cacheKey] = {
                    date: new Date(),
                    data: talks,
                };
                console.log("INFO: talks", talks);
                resolve(talks);
            });
        });
    }

    validate(topic, yearAndMonth) {
        if (!topic || typeof topic !== "string") {
            throw new Error("FIELD INVALID: topic");
        }
        if (!yearAndMonth || typeof yearAndMonth !== "string") {
            throw new Error("FIELD INVALID: yearAndMonth");
        }
    }
}

module.exports = GetTopicsByMonth;
