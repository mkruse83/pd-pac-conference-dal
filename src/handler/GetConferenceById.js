const {GET_CONFERENCE_BY_ID} = require("../helper/methods");
const getConferenceById = require("../helper/getConferenceById");

class GetConferencesHandler {

    canHandle(event) {
        return event.identifier === GET_CONFERENCE_BY_ID;
    }

    handle(event) {
        const id = event.id;
        const sortkey = event.sortkey;
        try {
            this.validate(id, sortkey);
        } catch (e) {
            return Promise.reject(e);
        }

        return getConferenceById(id, sortkey);
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

module.exports = GetConferencesHandler;
