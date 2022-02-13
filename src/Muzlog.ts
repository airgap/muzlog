import dash from 'rethinkdbdash';
import {readFile} from "fs/promises";
import {join} from 'path';
import {Server as HttpsServer} from 'https';
import * as routes from './routes/routes.js';
import {RequestListener, Server as HttpServer} from 'http';
import {Route} from "./Route.js";
import fetch from 'node-fetch';
import WebSocket, {WebSocketServer} from 'ws';
import {parse} from 'url';
import {Filter} from "./Filter.js";
import {Listener} from "./Listener.js";

const r: any = dash({
    servers: [{
        host: 'localhost',
        port: 28015
    }],
    db: 'Muzlog'
});

export class Muzlog {
    routes: Map<string, Route> = new Map(Object.entries(routes).map(([path, type]: [string, { new(): Route } & typeof Route]) => {
        const route = new type();
        route.init();
        return [path, route];
    }));
    _certs?: { [key: string]: string };
    api?: HttpsServer | HttpServer;

    beatInterval?: NodeJS.Timer;
    heartrate = 10000;

    constructor() {
    }

    startHttpApi = async () => {
        const names = ['cert', 'key', 'ca'];
        const paths = names.map(name => process.env[name.toUpperCase()+'_PATH']);
        if (paths.some(p => p)) {
            if (!paths.every(p => p))
                throw new Error('Some but not all cert paths set');
            const [cert, key, ca] = await Promise.all(paths.map(path => readFile(path!, 'utf8')));
            this.api = new HttpsServer({cert, key, ca}, this.httpListener).listen(443);
            console.log('Started HTTPS server (safe for prod)');
        } else {
            this.api = new HttpServer(this.httpListener).listen(80);
            console.log('Started HTTP server (not safe for prod)');
        }
        this.startHeartbeat();
    }

    startHeartbeat = () => {
        if (this.beatInterval)
            clearInterval(this.beatInterval);
        console.log('Starting heartbeat');
        this.beatInterval = setInterval(this.heartbeat, this.heartrate);
    }
    heartbeat = async () => {
        // console.log('Trying to beat own heart');
        const now = +new Date();
        this.sendEvent({
            type: 'heartbeat',
            source: 'muzlog',
            time: now,
            next: now + this.heartrate,
            rate: this.heartrate
        });
    }

    listeners: Listener[] = [];

    sendEvent = async (event: any) => {
        this.listeners
            .filter(({socket, filter}: Listener) => socket && filter?.evaluatePacket(event))
            .forEach(({socket}: Listener) => socket.emit(event.type, event));
    }

    httpListener: RequestListener = (req, res) => {
        let path = req?.url?.substring(1);
        if (path && path.length)
            path = path[0].toUpperCase() + path.substring(1);
        if (!path) {
            res.writeHead(404);
            res.end('Giggity');
            return;
        }
        req.on('upgrade', (request, socket, head) => {

            const {pathname} = parse(request.url);

            if (pathname?.substring(0, 4) === '/ws/') {
                if(!this.wsServer) {
                    console.error('Request made to offline WebSocket Server')
                    return;
                }
                this.wsServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
                    if(!this.wsServer) {
                        console.error('HTTP->WebSocket upgrade failed');
                        return;
                    }
                    this.wsServer.emit('connection', ws, request);
                });
            } else {
                socket.destroy();
            }
        });
        if (path in routes) {
            let data: string[] = [];
            req.on('data', (chunk) =>
                data.push(chunk)
            );
            req.on('end', async () => {
                const ip = req.headers['True-Client-IP']?.[0] ?? req.socket.remoteAddress;
                if (!ip)
                    return;
                if (!this.routes.has(path!)) {
                    res.writeHead(403);
                    res.end('Did you even try?');
                    return;
                }
                const {action, matches} = this.routes.get(path!)!;
                console.log('True-Client-IP', ip);
                if (!matches(ip)) {
                    res.writeHead(403);
                    res.end('DENIED!!!');
                    return;
                }
                let params = {};
                if (data.length)
                    try {
                        params = JSON.parse(data.join(''));
                    } catch (e) {
                        console.log('error', e);
                    }
                const result = await action(params, {r, req, sendEvent: this.sendEvent});
                console.log('result', result);
                res.end(JSON.stringify(result));
            })
        }
    }

    sockets = new WeakSet<WebSocket>();
    wsServer?: WebSocketServer;

    startWsApi = () => {
        this.wsServer = new WebSocketServer({
            port: 444,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    // See zlib defaults.
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                // Other options settable:
                clientNoContextTakeover: true, // Defaults to negotiated value.
                serverNoContextTakeover: true, // Defaults to negotiated value.
                serverMaxWindowBits: 10, // Defaults to negotiated value.
                // Below options specified as default values.
                concurrencyLimit: 10, // Limits zlib concurrency for perf.
                threshold: 1024 // Size (in bytes) below which messages
                // should not be compressed if context takeover is disabled.
            }
        })

        this.wsServer.on('connection', (ws: WebSocket) => {
            this.sockets.add(ws);
            ws.on('message', (data: string) => {
                console.info('received: %s', data);
                const event = JSON.parse(data);
                if(event?.type === 'filter') {
                    const listener = this.listeners.find(({socket}) => socket === ws);
                    if(listener)
                        listener.filter = new Filter(event.filter);
                    return;
                }
                this.sendEvent(event);
            });
        });
        console.info('WebSocket server started');
    }


    init = async () => {
        this.startWsApi()
        await this.startHttpApi();
    }

    certs = async (dir: string, certs: { [key: string]: string }) =>
        this._certs = Object.fromEntries(
            await Promise.all(
                Object.entries(certs)
                    .map(
                        async ([key, val]) =>
                            [key, await readFile(join(dir, `${val}.pem`), 'utf8')]
                    )));
}
