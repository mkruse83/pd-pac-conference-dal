const {
    ID,
    SORT,
} = require("../helper/fields");
const dynamoDb = require("./dynamoDB");

module.exports = (userId, conferenceId, conferenceSort, talk) => {

    const params = {
        TableName: "pac-conference",
        KeyConditionExpression: "#id = :id AND #sortkey = :sortkey",
        ExpressionAttributeNames: {
            "#id": ID,
            "#sortkey": SORT,
        },
        ExpressionAttributeValues: {
            ":id": "favorite#" + userId,
            ":sortkey": talk.from.getTime() + '#' + conferenceId + '#' + conferenceSort + '#' + talk.room.nameInLocation,
        },
        Select: "COUNT",
    };

    return new Promise((resolve, reject) => {
        dynamoDb.query(params, function (err, data) {
            if (err) {
                console.log("ERROR:", err, err.stack);
                reject(err);
                return;
            }
            console.log("SUCCESS:", data);
            const count = data.Count;
            console.log("INFO: favorites count", count);
            resolve(count);
        });
    });
};
