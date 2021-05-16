import fastify, { FastifyInstance } from "fastify";
import { Database } from "sqlite3";
import initFastify from "../bootstrap/fastify-bootstap";

import initSqlite from "../bootstrap/sqlite-bootstap";
import CONFIG from "./config";

export default class App {
    private static instance: App;
    private db!: Database;
    private server!: FastifyInstance;

    static getInstance() {
        if (!App.instance) {
            this.instance = new App();
        }
        return this.instance;
    }

    private constructor() { }

    get serverInstance() {
        return this.server;
    }
    get database() {
        return this.db;
    }

    async start() {
        try {
            this.db = await initSqlite();

            this.server = await fastify({ logger: true });
            await initFastify(this);
            await this.server.listen(CONFIG.SERVER_PORT, '0.0.0.0');

        } catch (error) {
            console.error(error)
            process.exit(1);
        }
    }
}