const {GET_CONFERENCES} = require("../helper/methods");
const getConferences = require("../helper/getConferences");

class GetConferencesHandler {

    canHandle(event) {
        return event.identifier === GET_CONFERENCES;
    }

    handle(event) {
        const month = event.month;
        try {
            this.validate(month);
        } catch (e) {
            return Promise.reject(e);
        }

        return getConferences(month);
    }

    validate(month) {
        if (!month || typeof month !== "string") {
            throw new Error("FIELD INVALID: conference month");
        }
    }
}

module.exports = GetConferencesHandler;
