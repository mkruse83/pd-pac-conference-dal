const {GET_CONFERENCES} = require("../helper/methods");

class GetConferencesHandler {

    canHandle(event) {
        return event.identifier === GET_CONFERENCES;
    }

    handle(event, context, dynamoDb) {
        const month = event.month;
        if (month) {
            this.validate(month);
        }
        const params = {
            TableName: "pac-conference",
            KeyConditionExpression: "#id = :month",
            ExpressionAttributeNames: {
                "#id": "uuid"
            },
            ExpressionAttributeValues: {
                ":month": {
                    S: "conference-2017-1"
                }
            }
        };

        return new Promise((resolve, reject) => {
            dynamoDb.query(params, function (err, data) {
                if (err) {
                    console.log("ERROR:", err, err.stack());
                    reject(err);
                    return;
                }
                console.log("SUCCESS:", data);
                const conferences = data.Items.map(item => ({
                    name: item.name.S,
                    from: new Date(Number.parseInt(item.from.N)),
                    to: new Date(Number.parseInt(item.to.N)),
                    topics: item.topics.L.map(topic => topic.S),
                }));
                console.log("INFO: conferences", conferences);
                resolve(conferences);
            });
        });
    }

    validate(month) {
        if (!month || typeof month !== "string") {
            throw new Error("FIELD INVALID: conference month");
        }
    }
}

module.exports = GetConferencesHandler;
