const {
    ID,
    SORT,
    CONFERENCE_ID,
    CONFERENCE_SORT,
    ROOM_NAME_IN_LOCATION,
    TALK_FROM,
} = require("../helper/fields");

const {TOGGLE_FAVORITE} = require("../helper/methods");
const getFavoriteCount = require("../helper/getFavoriteCount");
const getHash = require("../helper/getHash");
const dynamoDb = require("../helper/dynamoDB");

class ToggleFavoriteHandler {

    canHandle(event) {
        return event.identifier === TOGGLE_FAVORITE;
    }

    async handle(event) {
        const userId = event.userId;
        const conferenceId = event.id;
        const conferenceSort = event.sortkey;
        const talk = JSON.parse(event.talk);
        talk.from = new Date(talk.from);
        try {
            this.validate(userId, conferenceId, conferenceSort, talk);
        } catch (e) {
            return Promise.reject(e);
        }

        const hashedUserId = getHash(userId);
        const count = await getFavoriteCount(hashedUserId, conferenceId, conferenceSort, talk);
        if (count === 0) {
            const params = {
                Item: {
                    [ID]: 'favorite#' + hashedUserId,
                    [SORT]: talk.from.getTime() + '#' + conferenceId + '#' + conferenceSort + '#' + talk.room.nameInLocation,
                    [CONFERENCE_ID]: conferenceId,
                    [CONFERENCE_SORT]: conferenceSort,
                    [ROOM_NAME_IN_LOCATION]: talk.room.nameInLocation,
                    [TALK_FROM]: talk.from.getTime(),
                },
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
        } else {
            const params = {
                Key: {
                    [ID]: 'favorite#' + hashedUserId,
                    [SORT]: talk.from.getTime() + '#' + conferenceId + '#' + conferenceSort + '#' + talk.room.nameInLocation,
                },
                TableName: "pac-conference",
            };
            return new Promise((resolve, reject) => {
                dynamoDb.delete(params, function (err, data) {
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
    }

    validate(userId, conferenceId, conferenceSort, talk) {
        if (!userId || typeof userId !== "string") {
            throw new Error("FIELD INVALID: userId");
        }
        if (!conferenceId || typeof conferenceId !== "string") {
            throw new Error("FIELD INVALID: conferenceId");
        }
        if (!conferenceSort || typeof conferenceSort !== "string") {
            throw new Error("FIELD INVALID: conferenceSort");
        }
        if (!talk || !talk.from || !(talk.from instanceof Date)) {
            throw new Error("FIELD INVALID: talk");
        }
    }
}

module.exports = ToggleFavoriteHandler;
