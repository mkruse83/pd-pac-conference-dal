const {GET_FAVORITES} = require("../helper/methods");
const getFavorites = require("../helper/getFavorites");

class GetConferencesHandler {

    canHandle(event) {
        return event.identifier === GET_FAVORITES;
    }

    handle(event) {
        const userId = event.userId;
        try {
            this.validate(userId);
        } catch (e) {
            return Promise.reject(e);
        }

        return getFavorites(userId);
    }

    validate(userId) {
        if (!userId || typeof userId !== "string") {
            throw new Error("FIELD INVALID: userId");
        }
    }
}

module.exports = GetConferencesHandler;
