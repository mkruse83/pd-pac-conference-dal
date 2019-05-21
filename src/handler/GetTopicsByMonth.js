const {GET_TOPICS_BY_MONTH} = require("../helper/methods");
const {
    ID,
    TOPICS,
} = require("../helper/fields");
const dynamoDb = require("../helper/dynamoDB");

const cache = {};

class GetTopicsByMonth {

    canHandle(event) {
        return event.identifier === GET_TOPICS_BY_MONTH;
    }

    handle(event) {
        const yearAndMonth = event.yearAndMonth;
        try {
            this.validate(yearAndMonth);
        } catch (e) {
            return Promise.reject(e);
        }

        const cacheKey = yearAndMonth;
        // cache of three minutes
        if (cache[cacheKey] && new Date().getTime() - cache[cacheKey].date.getTime() < 180000) {
            console.log("INFO: cache hit for ", cacheKey);
            return Promise.resolve(cache[cacheKey].data);
        }

        const params = {
            TableName: "pac-conference",
            KeyConditionExpression: "#id = :id",
            ExpressionAttributeNames: {
                "#id": ID,
                "#topics": TOPICS,
            },
            ExpressionAttributeValues: {
                ":id": "talk#" + yearAndMonth,
            },
            Select: "SPECIFIC_ATTRIBUTES",
            ProjectionExpression: "#topics"

        };

        const self = this;
        return new Promise((resolve, reject) => {
            dynamoDb.query(params, function (err, data) {
                if (err) {
                    console.log("ERROR:", err, err.stack);
                    reject(err);
                    return;
                }
                console.log("SUCCESS:", data);
                const talks = data.Items;

                const topics = self.getTopicsFromTalks(talks);
                cache[cacheKey] = {
                    date: new Date(),
                    data: topics,
                };
                console.log("INFO: topics", topics);
                resolve(topics);
            });
        });
    }

    getTopicsFromTalks(talks) {
        const topics2Count = {};
        talks.filter(talk => talk.topics && talk.topics.length > 0)
            .map(talk => talk.topics)
            .flatMap((topics) => topics)
            .forEach((topic) => topics2Count[topic] = topics2Count[topic] ? topics2Count[topic] + 1 : 1);
        return topics2Count;
    }

    validate(yearAndMonth) {
        if (!yearAndMonth || typeof yearAndMonth !== "string") {
            throw new Error("FIELD INVALID: yearAndMonth");
        }
    }
}

module.exports = GetTopicsByMonth;
