const {
    ID,
    SORT,
    CONFERENCE_ID,
    CONFERENCE_SORT,
    ROOM_NAME_IN_LOCATION,
    TALK_FROM,
} = require("../helper/fields");
const dynamoDb = require("./dynamoDB");
const getHash = require("./getHash");

module.exports = (userId) => {

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const hashedUserId = getHash(userId);
    const params = {
        TableName: "pac-conference",
        KeyConditionExpression: "#id = :id AND #sortkey > :sortkey",
        ExpressionAttributeNames: {
            "#id": ID,
            "#sortkey": SORT,
            "#conferenceId": CONFERENCE_ID,
            "#conferenceSort": CONFERENCE_SORT,
            "#roomId": ROOM_NAME_IN_LOCATION,
            '#talkFrom': TALK_FROM,
        },
        ExpressionAttributeValues: {
            ":id": "favorite#" + hashedUserId,
            ":sortkey": "" + lastMonth.getTime(),
        },
        Select: "SPECIFIC_ATTRIBUTES",
        ProjectionExpression: "#conferenceId, #conferenceSort, #roomId, #talkFrom"
    };

    return new Promise((resolve, reject) => {
        dynamoDb.query(params, function (err, data) {
            if (err) {
                console.log("ERROR:", err, err.stack);
                reject(err);
                return;
            }
            console.log("SUCCESS:", data);
            const favorites = data.Items;
            console.log("INFO: favorites", favorites);
            resolve(favorites);
        });
    });
};
