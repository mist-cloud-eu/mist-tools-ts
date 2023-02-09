import axios from "axios";

type Handler = (envelope: Envelope) => void;

export type Envelope = { payload: string; messageId: string; traceId: string };
export function mistService(
  handlers: { [action: string]: Handler | undefined },
  init?: () => void
) {
  const action = process.argv[process.argv.length - 2];
  const handler = handlers[action];
  if (handler !== undefined) {
    const envelope: Envelope = JSON.parse(
      process.argv[process.argv.length - 1]
    );
    handler(envelope);
  } else if (init !== undefined) init();
}

export function postToRapids(event: string, payload: any) {
  axios.post(`${process.env.RAPIDS}/${event}`, payload);
}
