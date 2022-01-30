import { IncomingMessage } from "http";

export abstract class Action {
    ips: string[];
    act: (params: any, {r}: { r: any, req: IncomingMessage }) => Promise<any>
}
