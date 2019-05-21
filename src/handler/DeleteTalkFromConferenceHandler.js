const {
    ID,
    SORT,
} = require("../helper/fields");
const {DELETE_TALK} = require("../helper/methods");
const {formatToYearAndMonth} = require("../helper/date");
const dynamoDb = require("../helper/dynamoDB");
const getConferenceById = require("../helper/getConferenceById");

class DeleteTalkFromConferenceHandler {

    canHandle(event) {
        return event.identifier === DELETE_TALK;
    }

    async handle(event) {
        try {
            this.validate(event);
        } catch (e) {
            return Promise.reject(e);
        }

        const id = event.id;
        const sortkey = event.sortkey;
        const talkToDelete = this.parse(event.talk);

        const conf = await getConferenceById(id, sortkey);
        const talkInConference = conf.talks.filter(talk => talk.from === talkToDelete.from && talk.room.nameInLocation === talkToDelete.room.nameInLocation)[0];
        talkInConference.name = null;
        talkInConference.speaker = null;
        talkInConference.topics = null;

        const deleteItem = {
            [ID]: "talk#" + formatToYearAndMonth(talkInConference.from),
            [SORT]:new Date(talkInConference.from).getTime() + "#" + conf.name + "#" + talkInConference.room.nameInLocation,
        };

        const params = {
            TransactItems: [
                {
                    Put: {
                        Item: conf,
                        TableName: "pac-conference",
                    }
                },
                {
                    Delete: {
                        Key: deleteItem,
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

    parse({from, to, name, room, speaker, topics}) {
        return {
            from: new Date(from).getTime(),
            to: new Date(to).getTime(),
            name,
            room,
            speaker,
            topics,
        }
    }

    validate({id, sortkey, talk}) {
        if (!id) {
            throw new Error("FIELD INVALID: id");
        }
        if (!sortkey) {
            throw new Error("FIELD INVALID: sortkey");
        }
        if (!talk) {
            throw new Error("FIELD INVALID: talk");
        }
        this._validateTalk(talk);
    }

    _validateTalk({from, to, name, room, speaker, topics}) {
        if (!from) {
            throw new Error("FIELD INVALID: talk from");
        }
        if (!to) {
            throw new Error("FIELD INVALID: talk to");
        }
        if (!room) {
            throw new Error("FIELD INVALID: talk room");
        }
        if (!room.name) {
            throw new Error("FIELD INVALID: room name");
        }
        if (!room.nameInLocation) {
            throw new Error("FIELD INVALID: room nameInLocation");
        }
        if (name || speaker || topics) {
            if (!name) {
                throw new Error("FIELD INVALID: talk name");
            }
            if (!speaker) {
                throw new Error("FIELD INVALID: talk speaker");
            }
            if (!speaker.name) {
                throw new Error("FIELD INVALID: speaker name");
            }
            if (!speaker.title) {
                throw new Error("FIELD INVALID: speaker title");
            }
            if (!speaker.company) {
                throw new Error("FIELD INVALID: speaker company");
            }
            if (!topics) {
                throw new Error("FIELD INVALID: talk topics");
            }
        }
    }
}

module.exports = DeleteTalkFromConferenceHandler;
