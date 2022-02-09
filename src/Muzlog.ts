import dash from 'rethinkdbdash';
import {readFile} from "fs/promises";
import {join} from 'path';
import {Server} from 'https';
import * as routes from './routes/routes.js';
import {RequestListener} from 'http';
import {Route} from "./Route.js";
import fetch from 'node-fetch';

const r: any = dash({
    servers: [{
        host: 'localhost',
        port: 28015
    }],
    db: 'Muzlog'
});

export class Muzlog {
    routes: Map<string, Route> = new Map(Object.entries(routes).map(([path, type]: [string, {new (): Route} & typeof Route]) => {
        const route = new type();
        route.init();
        return [path, route];
    }));
    _certs?: { [key: string]: string };
    api?: Server;

    beatInterval?: NodeJS.Timer;

    constructor() {
    }

    startApi = async () => {
        this.api = new Server(await this.certs(
            '/etc/letsencrypt/live/log.muzz.in-0001',
            {
                cert: 'fullchain',
                key: 'privkey',
                ca: 'chain'
            }
        ), this.listener).listen(443);
        this.startHeatbeat();
    }

    startHeatbeat = () => {
        if(this.beatInterval)
            clearInterval(this.beatInterval);
        console.log('Starting heartbeat');
        this.beatInterval = setInterval(this.heartbeat, 1000);
    }
    heartbeat = async () => {
        console.log('Trying to beat own heart');
        await fetch('https://log.muzz.in/beatOwnHeart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: '{"Doggo": "Woof"}'
        })
    }

    listener: RequestListener = (req, res) => {
        let path = req?.url?.substring(1);
        if (path && path.length)
            path = path[0].toUpperCase() + path.substring(1);
        if (!path) {
            res.writeHead(404);
            res.end('Giggity');
            return;
        }
        if (path in routes) {
            let data: string[] = [];
            req.on('data', (chunk) =>
                data.push(chunk)
            );
            req.on('end', async () => {
                const ip = req.headers['True-Client-IP']?.[0] ?? req.socket.remoteAddress;
                if(!ip)
                    return;
                if(!this.routes.has(path!)) {
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
                const result = await action(params, {r, req});
                console.log('result', result);
                res.end(JSON.stringify(result));
            })
        }
    }

    init = () =>
        Promise.all([
            this.startApi()
        ]);

    certs = async (dir: string, certs: { [key: string]: string }) =>
        this._certs = Object.fromEntries(
            await Promise.all(
                Object.entries(certs)
                    .map(
                        async ([key, val]) =>
                            [key, await readFile(join(dir, `${val}.pem`), 'utf8')]
                    )));
}
