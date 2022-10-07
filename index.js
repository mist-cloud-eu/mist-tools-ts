"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToRapid = exports.mistService = void 0;
const http_lib_1 = require("@mistware/http-lib");
function mistService(handlers, init) {
    const action = process.argv[process.argv.length - 2];
    const handler = handlers[action];
    if (handler !== undefined) {
        const envelope = JSON.parse(process.argv[process.argv.length - 1]);
        handler(envelope);
    }
    else if (init !== undefined)
        init();
}
exports.mistService = mistService;
function postToRapid(event, payload) {
    (0, http_lib_1.urlReq)(`${process.env.RAPID}/${event}`, "POST", payload);
}
exports.postToRapid = postToRapid;
