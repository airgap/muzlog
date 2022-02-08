import {Action, Route} from "../Route";
export class ListPublicEvents extends Route {
    ips = ['*'];
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
