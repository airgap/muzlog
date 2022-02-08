import {Action, Route} from "../Route.js";
import {insertEvent} from "../insertEvent.js";
export class BeatOwnHeart extends Route {
    ips = [
        "10.0.0.1"
    ];
    action: Action = async (params, {r}) => {
        console.log("heartbeat", params);
        await insertEvent(
            'heartbeat/muzlog',
            params,
            r
        );
        return 'aaaaa';
    }

}
