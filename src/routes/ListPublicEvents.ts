import {Action, Route} from "../Route";
export const ListPublicEvents: Route = {
    ips: null,
    action: async (params, {r}) => {
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
