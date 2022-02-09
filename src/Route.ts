import {IncomingMessage} from "http";
// @ts-ignore
import jank from 'ipaddr.js';
const {parseCIDR, parse} = jank;

export type Action = (params: any, {r}: { r: any, req: IncomingMessage }) => Promise<any>;
export type CIDR = [any, number];
export abstract class Route {
    ips: string[] = [];
    ranges: CIDR[];
    abstract action: Action;

    constructor() {
        this.ranges = this.ips.map(ip => parseCIDR(ip));
    }
    matches = (ip: string): boolean => {
        if(this.ips[0] === '*')
            return true;
        const addr = parse(ip);
        console.log('incoming ip', ip, 'addr', addr);
        // @ts-ignore
        return this.ranges.some(range => addr.match(range));
    }
}
