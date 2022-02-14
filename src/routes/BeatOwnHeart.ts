import {Action, Route} from "../Route.js";
import {IpRanges} from "../IpRanges.js";
export class BeatOwnHeart extends Route {
    ips = IpRanges.local;
    action: Action = async (params, {r}) => {
        console.log("heartbeat", params);
        return 'aaaaa';
    }

}
