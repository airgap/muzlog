import WebSocket from "ws";
import {Filter} from "./Filter";

export class Listener {
    constructor(public socket: WebSocket, public filter?: Filter) {
    }
}