const {
    ID,
    SORT,
    CONF_NAME,
    CONF_DATE_FROM,
    CONF_DATE_TO,
    CONF_TOPICS,
    CONF_TALKS,
    CONF_LOCATION,
    LOCATION_NAME,
    LOCATION_ADDRESS,
    TALK_FROM,
    TALK_TO,
    TALK_TOPICS,
    TALK_NAME,
    TALK_ROOM,
    ROOM_NAME,
    ROOM_NAME_IN_LOCATION,
    TALK_SPEAKER,
    SPEAKER_NAME,
    SPEAKER_TITLE,
    SPEAKER_COMPANY,
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
                [CONF_LOCATION]: {
                    M: {
                        [LOCATION_NAME]: {
                            S: conference.location.name
                        },
                        [LOCATION_ADDRESS]: {
                            S: conference.location.address,
                        }
                    }
                },
                [CONF_TALKS]: {
                    L: conference.talks.map(talk => ({
                        M: {
                            [TALK_FROM]: {
                                N: JSON.stringify(talk.from.getTime())
                            },
                            [TALK_TO]: {
                                N: JSON.stringify(talk.to.getTime())
                            },
                            [TALK_NAME]: {
                                S: talk.name
                            },
                            [TALK_TOPICS]: {
                                L: talk.topics.map(topic => ({
                                    S: topic,
                                })),
                            },
                            [TALK_ROOM]: {
                                M: {
                                    [ROOM_NAME]: {
                                        S: talk.room.name
                                    },
                                    [ROOM_NAME_IN_LOCATION]: {
                                        S: talk.room.nameInLocation
                                    },
                                }
                            },
                            [TALK_SPEAKER]: {
                                M: {
                                    [SPEAKER_NAME]: {
                                        S: talk.speaker.name
                                    },
                                    [SPEAKER_TITLE]: {
                                        S: talk.speaker.title
                                    },
                                    [SPEAKER_COMPANY]: {
                                        S: talk.speaker.company
                                    },
                                }
                            },
                        },
                    }))
                }
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
        if (!name) {
            throw new Error("FIELD INVALID: talk name");
        }
        if (!room) {
            throw new Error("FIELD INVALID: talk room");
            if (!room.name) {
                throw new Error("FIELD INVALID: room name");
            }
            if (!room.nameInLocation) {
                throw new Error("FIELD INVALID: room nameInLocation");
            }
        }
        if (!speaker) {
            throw new Error("FIELD INVALID: talk speaker");
            if (!speaker.name) {
                throw new Error("FIELD INVALID: speaker name");
            }
            if (!speaker.title) {
                throw new Error("FIELD INVALID: speaker title");
            }
            if (!speaker.company) {
                throw new Error("FIELD INVALID: speaker company");
            }
        }
        if (!topics) {
            throw new Error("FIELD INVALID: talk topics");
        }
    }
}

module.exports = AddConferenceHandler;
