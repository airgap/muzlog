import {Action, Route} from "../Route.js";
import {IpRanges} from "../IpRanges";
export class BeatHeart extends Route {
    ips = IpRanges.all;
    action: Action = async (params, {r}) => {
        console.log("heartbeat", params);
        return 'aaaaa';
    }
}
