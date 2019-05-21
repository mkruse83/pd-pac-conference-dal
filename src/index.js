require("aws-xray-sdk");

const AddConferenceHandler = require("./handler/AddConferenceHandler");
const ConferenceByYearHandler = require("./handler/GetConferencesByYearHandler");
const ConferenceById = require("./handler/GetConferenceById");
const AddTalkHandler = require("./handler/AddTalkHandler");
const DeleteTalkFromConferenceHandler = require("./handler/DeleteTalkFromConferenceHandler");

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
        new DeleteTalkFromConferenceHandler(),
    ];


    const foundHandler = handlers.find(handler => handler.canHandle(event, context));
    let result = Promise.resolve({
        statusCode: 400,
        payload: "Unknown error occured."
    });
    if (foundHandler) {
        try {
            const data = await foundHandler.handle(event, context);
            result = {
                statusCode: 200,
                payload: data,
            }
        } catch (e) {
            console.log("ERROR: ", e);
            result = {
                statusCode: 500,
                payload: e.message
            }
        }
    } else {
        console.log("WARNING:", "could not handle");
    }
    return result;
};
