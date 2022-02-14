import {IncomingMessage} from "http";
// @ts-ignore
import jank from 'ipaddr.js';
const {parseCIDR, parse} = jank;

export type Action = (params: any, {r, req, sendEvent}: { r: any, req: IncomingMessage, sendEvent: Function }) => Promise<any>;
export type CIDR = [any, number];
export abstract class Route {
    abstract ips: string[];
    ranges?: CIDR[];
    abstract action: Action;
    init = () => {
        this.ranges = this.ips.map(ip => parseCIDR(ip));
        // console.log('made ips', this.ips, 'into ranges', this.ranges);
    }
    matches = (ip: string): boolean => {
        const addr = parse(ip);
        if(!this.ranges)
            return false;
        // @ts-ignore
        const ok = this.ranges.some(range => addr.kind() === range[0].kind() && addr.match(range));
        return ok;
    }
}
