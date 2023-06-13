import axios, { AxiosResponse } from "axios";

export module PayloadTypes {
  export interface UploadFileInfo<T> {
    files: { originalname: string; name: string; type: string; size: number }[];
    passthrough: T;
  }
  export interface StoreFileInfo<T> {
    files: string[];
    passthrough: T;
  }
  export interface FileContent<T> {
    content: { data: number[] };
    passthrough: T;
  }
}
export type PayloadBufferPromise = Promise<Buffer>;

type Handler = (
  payloadBuffer: PayloadBufferPromise,
  envelope: Envelope
) => void;

export type Envelope = { messageId: string; traceId: string };
export async function mistService(
  handlers: { [action: string]: Handler | undefined },
  init?: () => Promise<void>
) {
  const action = process.argv[process.argv.length - 2];
  const handler = handlers[action];
  if (handler !== undefined) {
    const envelope: Envelope = JSON.parse(
      process.argv[process.argv.length - 1]
    );
    handler(getPayload(), envelope);
  } else if (init !== undefined) await init();
}

type RapidsResponse = AxiosResponse<any, any>;
export function postToRapids(
  event: "$reply",
  payload: any,
  contentType?: string
): Promise<RapidsResponse>;
export function postToRapids(
  event: "$join",
  payload: string
): Promise<RapidsResponse>;
export function postToRapids(
  event: "$broadcast",
  payload: { to: string; event: string; payload: any }
): Promise<RapidsResponse>;
export function postToRapids(
  event: "$send",
  payload: { to: string; event: string; payload: any }
): Promise<RapidsResponse>;
export function postToRapids(
  event: "$retrieve",
  payload: {
    file: string;
    emit: string;
    passthrough: any;
  }
): Promise<RapidsResponse>;
export function postToRapids(
  event: "$store",
  payload: {
    contents: Buffer[];
    emit: string;
    passthrough: any;
  }
): Promise<RapidsResponse>;
export function postToRapids(
  event: string,
  payload: any
): Promise<RapidsResponse>;
export function postToRapids(
  event: string,
  payload: any,
  contentType?: string
) {
  return axios.post(
    `${process.env.RAPIDS}/${event}`,
    payload,
    contentType !== undefined
      ? {
          headers: { "Content-Type": contentType },
        }
      : {}
  );
}
export function replyToOrigin(payload: any, contentType?: string) {
  return postToRapids("$reply", payload, contentType);
}
export function joinChannel(channel: string) {
  return postToRapids("$join", channel);
}
export function broadcastToChannel(to: string, event: string, payload: any) {
  return postToRapids("$broadcast", { to, event, payload });
}
export function sendToClient(to: string, event: string, payload: any) {
  return postToRapids("$send", { to, event, payload });
}
export function requestFileThenEmit(
  file: string,
  emitEvent: string,
  passthrough: any
) {
  return postToRapids("$retrieve", { file, emit: emitEvent, passthrough });
}
export function storeFilesThenEmit(
  contents: Buffer[],
  emitEvent: string,
  passthrough: any
) {
  return postToRapids("$store", { contents, emit: emitEvent, passthrough });
}

export async function parseUploadFileInfo<T>(p: Promise<Buffer>) {
  let result: PayloadTypes.UploadFileInfo<T> = JSON.parse((await p).toString());
  return result;
}
export async function parseRetrieveFileContent<T>(p: Promise<Buffer>) {
  let result: PayloadTypes.FileContent<T> = JSON.parse((await p).toString());
  return { ...result, content: Buffer.from(result.content.data) };
}
export async function parseStoreFileContent<T>(p: Promise<Buffer>) {
  let result: PayloadTypes.StoreFileInfo<T> = JSON.parse((await p).toString());
  return result;
}

function getPayload() {
  return new Promise<Buffer>((resolve, reject) => {
    let bufs: Buffer[] = [];
    process.stdin.on("data", (data: Buffer) => {
      bufs.push(data);
    });
    process.stdin.on("end", () => {
      resolve(Buffer.concat(bufs));
    });
  });
}
