require("aws-xray-sdk");

const AddConferenceHandler = require("./handler/AddConferenceHandler");
const ConferenceByYearHandler = require("./handler/GetConferencesByYearHandler");
const ConferenceById = require("./handler/GetConferenceById");
const AddTalkHandler = require("./handler/AddTalkHandler");

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
        new AddTalkHandler(),
    ];


    const foundHandler = handlers.find(handler => handler.canHandle(event, context));
    let result = Promise.resolve({
        status: 400,
        payload: "Unknown error occured."
    });
    if (foundHandler) {
        try {
            const data = await foundHandler.handle(event, context);
            result = {
                status: 200,
                payload: data,
            }
        } catch (e) {
            result = {
                status: 500,
                payload: e.message
            }
        }
    } else {
        console.log("WARNING:", "could not handle");
    }
    return result;
};
