import {Action, Route} from "../Route.js";
export class BeatHeart extends Route {
    ips = [
        "0.0.0.0/0"
    ];
    action: Action = async (params, {r}) => {
        console.log("heartbeat", params);
        return 'aaaaa';
    }
}
