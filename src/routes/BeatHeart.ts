import {Action, Route} from "../Route";
import {insertEvent} from "../insertEvent";
export class BeatHeart extends Route {
    ips = [
        "*"
    ];
    action: Action = async (params, {r}) => {
        console.log("heartbeat", params);
        await insertEvent(
            'vcs/github/webhook',
            params,
            r
        );
        return 'aaaaa';
    }
}
