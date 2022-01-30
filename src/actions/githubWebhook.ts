import * as checkIp from 'ip-range-check';
import {Action} from "../Action";
import {insertEvent} from "../insertEvent";

const githubWebhookIps = [
    "192.30.252.0/22",
    "185.199.108.0/22",
    "140.82.112.0/20",
    "143.55.64.0/20",
    "2a0a:a440::/29",
    "2606:50c0::/32"
];
export const githubWebhook: Action = async (params, {r, req}) => {
    if(!checkIp(req.socket.remoteAddress ?? '', githubWebhookIps))
        return r.status(403).send("Unless you're a GitHub webhook, you can kindly heck off");
    console.log("githubWebhook", params);
    await insertEvent(
        'vcs/github',
        params,
        r
    );
    return 'aaaaa';
}
