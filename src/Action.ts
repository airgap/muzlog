import { IncomingMessage } from "http";

export type Action = (params: any, {r}: { r: any, req: IncomingMessage }) => Promise<any>;
