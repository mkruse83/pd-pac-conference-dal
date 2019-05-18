const {
    ID,
    SORT,
} = require("../helper/fields");
const {ADD_CONFERENCE} = require("../helper/methods");
const {formatToYearAndMonth} = require("../helper/date");
const dynamoDb = require("../helper/dynamoDB");

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

        const conf = this.parse(event.conference);
        const conference = {
            ...conf,
            [ID]: "conference-" + formatToYearAndMonth(conf.from),
            [SORT]: conf.from.getTime() + "#" + conf.name,
        };


        const params = {
            Item: conference,
            TableName: "pac-conference",
        };
        return new Promise((resolve, reject) => {
            dynamoDb.put(params, function (err, data) {
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

    parse({name, from, to, topics, talks, location}) {
        return {
            name,
            from: new Date(from),
            to: new Date(to),
            topics,
            location,
            talks: this._parseTalks(talks),
        }
    }

    validate({name, from, to, topics, talks}) {
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
        if (talks) {
            talks.forEach(talk => this._validateTalk(talk))
        }
    }

    _parseTalks(talks) {
        return talks.map(talk => this._parseTalk(talk));
    }

    _parseTalk({from, to, name, room, speaker, topics}) {
        return {
            from: new Date(from),
            to: new Date(to),
            name,
            room,
            speaker,
            topics,
        }
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

module.exports = AddConferenceHandler;
