"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStoreFileContent = exports.parseRetrieveFileContent = exports.parseUploadFileInfo = exports.storeFilesThenEmit = exports.requestFileThenEmit = exports.sendToClient = exports.broadcastToChannel = exports.joinChannel = exports.replyToOrigin = exports.postToRapids = exports.mistService = void 0;
const axios_1 = __importDefault(require("axios"));
async function mistService(handlers, init) {
    const action = process.argv[process.argv.length - 2];
    const handler = handlers[action];
    if (handler !== undefined) {
        const envelope = JSON.parse(process.argv[process.argv.length - 1]);
        handler(getPayload(), envelope);
    }
    else if (init !== undefined)
        await init();
}
exports.mistService = mistService;
function postToRapids(event, payload, contentType) {
    return axios_1.default.post(`${process.env.RAPIDS}/${event}`, payload, contentType !== undefined
        ? {
            headers: { "Content-Type": contentType },
        }
        : {});
}
exports.postToRapids = postToRapids;
function replyToOrigin(payload, contentType) {
    return postToRapids("$reply", payload, contentType);
}
exports.replyToOrigin = replyToOrigin;
function joinChannel(channel) {
    return postToRapids("$join", channel);
}
exports.joinChannel = joinChannel;
function broadcastToChannel(to, event, payload) {
    return postToRapids("$broadcast", { to, event, payload });
}
exports.broadcastToChannel = broadcastToChannel;
function sendToClient(to, event, payload) {
    return postToRapids("$send", { to, event, payload });
}
exports.sendToClient = sendToClient;
function requestFileThenEmit(file, emitEvent, passthrough) {
    return postToRapids("$retrieve", { file, emit: emitEvent, passthrough });
}
exports.requestFileThenEmit = requestFileThenEmit;
function storeFilesThenEmit(contents, emitEvent, passthrough) {
    return postToRapids("$store", { contents, emit: emitEvent, passthrough });
}
exports.storeFilesThenEmit = storeFilesThenEmit;
async function parseUploadFileInfo(p) {
    let result = JSON.parse((await p).toString());
    return result;
}
exports.parseUploadFileInfo = parseUploadFileInfo;
async function parseRetrieveFileContent(p) {
    let result = JSON.parse((await p).toString());
    return { ...result, content: Buffer.from(result.content.data) };
}
exports.parseRetrieveFileContent = parseRetrieveFileContent;
async function parseStoreFileContent(p) {
    let result = JSON.parse((await p).toString());
    return result;
}
exports.parseStoreFileContent = parseStoreFileContent;
function getPayload() {
    return new Promise((resolve, reject) => {
        let bufs = [];
        process.stdin.on("data", (data) => {
            bufs.push(data);
        });
        process.stdin.on("end", () => {
            resolve(Buffer.concat(bufs));
        });
    });
}
