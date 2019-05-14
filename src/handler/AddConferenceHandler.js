const {ID, SORT, CONF_NAME, CONF_DATE_FROM, CONF_DATE_TO, CONF_TOPICS} = require("../helper/fields");
const {ADD_CONFERENCE} = require("../helper/methods");
const {formatToYearAndMonth} = require("../helper/date");
const dynamoDb = require("./dynamoDB");

class AddConferenceHandler {

    canHandle(event) {
        return event.identifier === ADD_CONFERENCE;
    }

    handle(event) {
        try {
            this.validate(event.conference);
        } catch (e) {
            return Promise.reject(e);
        }
        const conference = this.parse(event.conference);

        const params = {
            Item: {
                [ID]: {
                    S: "conference-" + formatToYearAndMonth(conference.from),
                },
                [SORT]: {
                    S: conference.from.getTime() + "#" + conference.name,
                },
                [CONF_NAME]: {
                    S: conference.name,
                },
                [CONF_DATE_FROM]: {
                    N: JSON.stringify(conference.from.getTime()),
                },
                [CONF_DATE_TO]: {
                    N: JSON.stringify(conference.to.getTime()),
                },
                [CONF_TOPICS]: {
                    L: conference.topics.map(topic => ({
                        S: topic
                    })),
                },
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "pac-conference",
        };
        return new Promise((resolve, reject) => {
            dynamoDb.putItem(params, function (err, data) {
                if (err) {
                    console.log("ERROR:", err, err.stack);
                    reject(err);
                    return;
                }
                console.log("SUCCESS:", data);
                resolve(data);
            });
        });
    }

    parse({name, from, to, topics}) {
        return {
            name,
            from: new Date(from),
            to: new Date(to),
            topics,
        }
    }

    validate({name, from, to, topics}) {
        if (!name || typeof name !== "string") {
            throw new Error("FIELD INVALID: conference name");
        }
        if (!from) {
            throw new Error("FIELD INVALID: conference from");
        }
        if (!to) {
            throw new Error("FIELD INVALID: conference to");
        }
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            throw new Error("FIELD INVALID: conference topics");
        }
    }
}

module.exports = AddConferenceHandler;
