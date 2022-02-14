import {Action, Route} from "../Route.js";
import {IpRanges} from "../IpRanges.js";
export class SendEvent extends Route {
    ips = IpRanges.all;
    action: Action = async (params, {r, sendEvent}) => {
        sendEvent(params);
        return 'aaaaa';
    }
}
