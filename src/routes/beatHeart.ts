import {Action, Route} from "../Route";
import {insertEvent} from "../insertEvent";
export const GithubWebhook: Route = {
    ips: [
        "*"
    ],
    action: async (params, {r}) => {
        console.log("heartbeat", params);
        await insertEvent(
            'vcs/github/webhook',
            params,
            r
        );
        return 'aaaaa';
    }

}
