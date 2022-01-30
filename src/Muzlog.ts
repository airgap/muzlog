import * as dash from 'rethinkdbdash';
import {readFile} from "fs/promises";
import {join} from 'path';
import {Server} from 'https';
import * as actions from './actions/actions';
import {RequestListener} from 'http';
import {Action} from "./Action";

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
                cert: 'cert',
                key: 'privkey'
            }
        ), this.listener).listen(443);
    }

    listener: RequestListener = (req, res) => {
        const ACTION = req?.url?.substring(1);
        if (!ACTION) {
            res.writeHead(404);
            res.end('Giggity');
            return;
        }
        if (ACTION in actions) {
            let data: string[] = [];
            req.on('data', (chunk) =>
                data.push(chunk)
            );
            req.on('end', async () => {
                try { //                                                      LIGHTS
                    const params = JSON.parse(data.join('')); //              CAMERA
                    const result = await (<{ [key: string]: Action }>actions)[ACTION!!!](params, {r});
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
