import {Action, Route} from "../Route.js";
import {IpRanges} from "../IpRanges.js";
export class ListPublicEvents extends Route {
    ips = IpRanges.all;
    action: Action = async (params, {r}) => {
        console.log("listing public events", params);
        return await r.table('Events')
            .orderBy(r.desc('ingestedAt'))
            .filter({
                repository: {
                    visibility: 'public'
                }
            })
            .limit(10);
    }

}
