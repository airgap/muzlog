import {Action, Route} from "../Route";
import {insertEvent} from "../insertEvent";
export const GithubWebhook: Route = {
    ips: [
        "192.30.252.0/22",
        "185.199.108.0/22",
        "140.82.112.0/20",
        "143.55.64.0/20",
        "2a0a:a440::/29",
        "2606:50c0::/32"
    ],
    action: async (params, {r}) => {
        console.log("githubWebhook", params);
        await insertEvent(
            'vcs/github',
            params,
            r
        );
        return 'aaaaa';
    }

}
