const {GET_CONFERENCES_BY_YEAR} = require("../helper/methods");
const getConferences = require("../helper/getConferences");

class GetConferencesHandler {

    canHandle(event) {
        return event.identifier === GET_CONFERENCES_BY_YEAR;
    }

    handle(event) {
        const year = event.year;
        try {
            this.validate(year);
        } catch (e) {
            return Promise.reject(e);
        }

        const promises = [];
        for (let i = 1; i <= 12; i++) {
            promises.push(getConferences(year + "-" + i));
        }
        return Promise.all(promises)
            .then((results) => results.flatMap((res) => res));
    }

    validate(year) {
        if (!year || typeof year !== "number") {
            throw new Error("FIELD INVALID: conference year");
        }
    }
}

module.exports = GetConferencesHandler;
