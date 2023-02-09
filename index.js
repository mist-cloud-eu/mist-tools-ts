"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToRapids = exports.mistService = void 0;
const axios_1 = __importDefault(require("axios"));
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
function postToRapids(event, payload) {
    axios_1.default.post(`${process.env.RAPIDS}/${event}`, payload);
}
exports.postToRapids = postToRapids;
