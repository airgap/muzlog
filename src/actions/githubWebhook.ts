import {Action} from "../Action";

export const githubWebhook: Action = (params, {r}) => {
    console.log("githubWebhook", params);
    return 'aaaaa';
}
