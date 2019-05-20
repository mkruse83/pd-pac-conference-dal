const {
    ID,
    SORT,
} = require("../helper/fields");
const {ADD_TALK} = require("../helper/methods");
const {formatToYearAndMonth} = require("../helper/date");
const getConferenceById = require("../helper/getConferenceById");
const dynamoDb = require("../helper/dynamoDB");

class AddTalkHandler {

    canHandle(event) {
        return event.identifier === ADD_TALK;
    }

    async handle(event) {
        const id = event.id;
        const sortkey = event.sortkey;
        try {
            this.validate(id, sortkey);
        } catch (e) {
            return Promise.reject(e);
        }

        const talk  = {
          ...event.talk,
          from: new Date(event.talk.from).getTime(),
          to: new Date(event.talk.from).getTime(),
        };
        const from = new Date(event.talk.from).getTime();
        const conf = await getConferenceById(id, sortkey);
        const oldTalk = conf.talks.filter(talk => {
            return new Date(talk.from).getTime() === from && talk.room.nameInLocation === talk.room.nameInLocation;
        })[0];
        const index = conf.talks.indexOf(oldTalk);
        conf.talks.splice(index, 1, talk);

        const newTalk = {
            ...talk,
            [ID]: "talk#" + formatToYearAndMonth(talk.from),
            [SORT]: talk.from + "#" + conf.name + "#" + talk.room.nameInLocation,
        };
        const op = {
            [ID]: "op",
            [SORT]: new Date().getTime() + "#" + new Date(conf.from).getTime() + "#" + conf.name,
            op: "addTalk",
            talks: [newTalk]
        };
        const newConference = {
            [ID]: "conference#" + formatToYearAndMonth(conf.from),
            [SORT]: new Date(conf.from).getTime() + "#" + conf.name,
            ...conf,
        };

        const params = {
            TransactItems: [
                {
                    Put: {
                        Item: newConference,
                        TableName: "pac-conference",
                    }
                },
                {
                    Put: {
                        Item: op,
                        TableName: "pac-conference-ops",
                    }
                }
            ]
        };
        return new Promise((resolve, reject) => {
            dynamoDb.transactWrite(params, function (err, data) {
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

    validate(id, sortkey) {
        if (!id || typeof id !== "string") {
            throw new Error("FIELD INVALID: id");
        }
        if (!sortkey || typeof sortkey !== "string") {
            throw new Error("FIELD INVALID: sortkey");
        }
    }
}

module.exports = AddTalkHandler;
