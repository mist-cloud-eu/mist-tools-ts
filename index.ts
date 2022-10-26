import { urlReq } from "@mistware/http-lib";

type Handler<T> = (envelope: Envelope<T>) => void;

export type Envelope<T> = { payload: T; messageId: string; traceId: string };
export function mistService(
  handlers: { [action: string]: Handler<any> | undefined },
  init?: () => void
) {
  const action = process.argv[process.argv.length - 2];
  const handler = handlers[action];
  if (handler !== undefined) {
    const envelope = JSON.parse(process.argv[process.argv.length - 1]);
    handler(envelope);
  } else if (init !== undefined) init();
}

export function postToRapid(event: string, payload: object) {
  urlReq(`${process.env.RAPID}/${event}`, "POST", payload);
}
