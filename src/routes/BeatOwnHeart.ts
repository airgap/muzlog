import {Action, Route} from "../Route.js";
export class BeatOwnHeart extends Route {
    ips = [
        "10.0.0.1"
    ];
    action: Action = async (params, {r}) => {
        console.log("heartbeat", params);
        return 'aaaaa';
    }

}
