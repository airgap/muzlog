// @ts-ignore TS6133
import * as dash from 'rethinkdbdash';
import {readFile} from "fs/promises";
import {join} from 'path';
import {Server} from 'https';

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
            '/etc/letsencrypt/live/log.muzz.in',
            {
                cert: 'cert',
                key: 'privkey'
            }
        )).listen(443);
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
