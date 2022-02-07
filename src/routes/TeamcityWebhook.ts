import {Action, Route} from "../Route";
import {insertEvent} from "../insertEvent";
export const TeamcityWebhook: Route = {
    ips: ['*'],
    action: async (params, {r}) => {
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