import {Action, Route} from "../Route.js";
import {insertEvent} from "../insertEvent.js";
export class TeamcityWebhook extends Route {
    ips = ['*'];
    action: Action = async (params, {r}) => {
        console.log("teamcityWebhook", params);
        if(params.secret !== process.env.TEAMCITY_WEBHOOK_SECRET)
            return {status: 403, body: "YAH YEET"};

        await insertEvent(
            'ci/teamcity/webhook',
            params,
            r
        );
        return 'aaaaa';
    }

}
