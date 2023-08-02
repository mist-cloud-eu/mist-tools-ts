"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStoreFileContent = exports.parseRetrieveFileContent = exports.parseUploadFileInfo = exports.storeFilesThenEmit = exports.requestFileThenEmit = exports.sendToClient = exports.broadcastToChannel = exports.joinChannel = exports.replyToOrigin = exports.postToRapids = exports.mistService = void 0;
const ext2mime_1 = require("@mist-cloud-eu/ext2mime");
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
function postToRapids(event, payload) {
    return axios_1.default.post(`${process.env.RAPIDS}/${event}`, payload, payload !== undefined
        ? { headers: { "Content-Type": payload.mime.toString() } }
        : {});
}
exports.postToRapids = postToRapids;
function replyToOrigin(payload) {
    return postToRapids("$reply", payload);
}
exports.replyToOrigin = replyToOrigin;
function joinChannel(channel) {
    return postToRapids("$join", {
        content: channel,
        mime: ext2mime_1.COMMON_MIME_TYPES.txt[0],
    });
}
exports.joinChannel = joinChannel;
function broadcastToChannel(to, event, payload) {
    return postToRapids("$broadcast", {
        content: { to, event, payload },
        mime: ext2mime_1.COMMON_MIME_TYPES.json[0],
    });
}
exports.broadcastToChannel = broadcastToChannel;
function sendToClient(to, event, payload) {
    return postToRapids("$send", {
        content: { to, event, payload },
        mime: ext2mime_1.COMMON_MIME_TYPES.json[0],
    });
}
exports.sendToClient = sendToClient;
function requestFileThenEmit(file, emitEvent, passthrough) {
    return postToRapids("$retrieve", {
        content: { file, emit: emitEvent, passthrough },
        mime: ext2mime_1.COMMON_MIME_TYPES.json[0],
    });
}
exports.requestFileThenEmit = requestFileThenEmit;
function storeFilesThenEmit(contents, emitEvent, passthrough) {
    return postToRapids("$store", {
        content: { contents, emit: emitEvent, passthrough },
        mime: ext2mime_1.COMMON_MIME_TYPES.json[0],
    });
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
