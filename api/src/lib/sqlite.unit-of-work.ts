import { Database } from "sqlite3";
import App from "../app";

export default class SqliteUnitOfWork {
    private startedTransaction = false;

    constructor(private _autocommit = true, private useTransaction = true, private db?: Database) { }

    public get autocommit() {
        return this._autocommit;
    }
    public set autocommit(value) {
        this._autocommit = value;
    }


    async query(sqlQuery: string, params?: any[]) {
        if (!this.startedTransaction && this.useTransaction) {
            await this.asyncQuery('BEGIN TRANSACTION');
            console.log('Transaction started!')
            this.startedTransaction = true;
        }
        try {
            const result = await this.asyncQuery(sqlQuery, params);
            if (this._autocommit && this.useTransaction) { await this.commit(); }
            return result;
        } catch (error) {
            if (this._autocommit && this.useTransaction) { await this.rollback(); }
            throw error;
        }
    }

    commit() {
        return this.asyncQuery('COMMIT');
    }

    rollback() {
        return this.asyncQuery('ROLLBACK');
    }

    private asyncQuery(sqlQuery: string, params?: any[]) {
        const db = this.db || App.getInstance().database;
        const isSelect = /^ *select/i.test(sqlQuery);
        // 
        return new Promise<any[] & { lastID?: number, changes?: number }>((resolve, reject) => {
            if (isSelect) {
                db.all(sqlQuery, params, (err, result) => {
                    if (err) {
                        reject(err);
                    } else { resolve(result); }
                });
            } else {
                db.run(sqlQuery, params, function (err) {
                    if (err) {
                        reject(err);
                    } else { resolve(Object.assign([], { ...this })) }
                })
            }
        })
    }
}