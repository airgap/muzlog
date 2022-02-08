import {IncomingMessage} from "http";
import {parseCIDR, IPv4, IPv6} from 'ipaddr.js';

export type Action = (params: any, {r}: { r: any, req: IncomingMessage }) => Promise<any>;
export type CIDR = [IPv4 | IPv6, number];
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
        const addr = parseCIDR(ip);
        // @ts-ignore
        return this.ranges.some(range => addr.match(range));
    }
}
