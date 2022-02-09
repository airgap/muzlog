import {IncomingMessage} from "http";
// @ts-ignore
import jank from 'ipaddr.js';
const {parseCIDR, parse} = jank;

export type Action = (params: any, {r}: { r: any, req: IncomingMessage }) => Promise<any>;
export type CIDR = [any, number];
export abstract class Route {
    abstract ips: string[];
    ranges?: CIDR[];
    abstract action: Action;
    init = () => {
        this.ranges = this.ips.map(ip => parseCIDR(ip));
        console.log('made ips', this.ips, 'into ranges', this.ranges);
    }
    matches = (ip: string): boolean => {
        if(this.ips[0] === '*')
            return true;
        const addr = parse(ip);
        console.log('incoming ip', ip, 'addr', addr, 'ranges', this.ranges);
        // @ts-ignore
        const ok = this.ranges.some(range => addr.match(range));
        console.log('ok', ok);
        return ok;
    }
}
