require("aws-xray-sdk");

const AddConferenceHandler = require("./handler/AddConferenceHandler");
const ConferenceHandler = require("./handler/GetConferencesHandler");
const ConferenceByYearHandler = require("./handler/GetConferencesByYearHandler");
const ConferenceById= require("./handler/GetConferenceById");

const flatMap = (f, arr) => arr.reduce((x, y) => [...x, ...f(y)], []);
Array.prototype.flatMap = function (f) {
    return flatMap(f, this)
};

exports.handler = async (event, context) => {
    console.log(
        "START pd-pac-conference-dal; event:",
        JSON.stringify(event, null, 2),
        "context: ",
        JSON.stringify(context, null, 2)
    );

    const handlers = [
        new AddConferenceHandler(),
        new ConferenceById(),
        new ConferenceByYearHandler(),
        new ConferenceHandler(),
    ];


    const foundHandler = handlers.find(handler => handler.canHandle(event, context));
    let result = Promise.resolve({
        status: 400,
        payload: "Unknown error occured."
    });
    if (foundHandler) {
        result = foundHandler.handle(event, context)
            .then(data => ({
                status: 200,
                payload: data,
            })).catch(e => ({
                status: 500,
                payload: e.message
            }));
    } else {
        console.log("WARNING:", "could not handle");
    }
    return result;
};
