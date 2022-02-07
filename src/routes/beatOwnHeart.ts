import {Action, Route} from "../Route";
import {insertEvent} from "../insertEvent";
export const GithubWebhook: Route = {
    ips: [
        "10.0.0.1"
    ],
    action: async (params, {r}) => {
        console.log("heartbeat", params);
        await insertEvent(
            'heartbeat/muzlog',
            params,
            r
        );
        return 'aaaaa';
    }

}
