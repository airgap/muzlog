import * as dash from 'rethinkdbdash';
import {readFile} from "fs/promises";
import {join} from 'path';
import {Server} from 'https';
import * as routes from './routes/routes';
import {RequestListener} from 'http';
import {Route} from "./Route";
import * as checkIp from 'ip-range-check';

const r: any = dash({
    servers: [{
        host: 'localhost',
        port: 28015
    }],
    db: 'Muzlog'
});

export class Muzlog {
    _certs?: { [key: string]: string };
    api?: Server;

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
    }

    listener: RequestListener = (req, res) => {
        let path = req?.url?.substring(1);
        if(path && path.length)
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
                try {
                    const params = JSON.parse(data.join(''));
                    const {action, ips} = (<{ [key: string]: Route }><unknown>routes)[path!!!];
                    const ip = req.headers['True-Client-IP'];
                    console.log('True-Client-IP', ip)
                    if (ips && !checkIp(ip as string, ips)) {
                        res.writeHead(403);
                        res.end('DENIED!!!');
                        return;
                    }
                    const result = await action(params, {r, req});
                    console.log('result', result);
                    res.end(JSON.stringify(result));
                } catch (e) {
                    console.log('error', e);
                }
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
