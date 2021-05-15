import { Database } from "sqlite3";
import * as path from 'path';
import SqliteUnitOfWork from "../src/lib/sqlite.unit-of-work";

export default async function initSqlite() {
    const db = await new Promise<Database>((resolve, reject) => {
        const database = new Database(path.resolve(__dirname, '_.db'), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(database);
            }
        });
    })
    const uow = new SqliteUnitOfWork(true, false, db);
    await uow.query('PRAGMA foreign_keys = ON')
    // await createSchema(uow);
    return db;
}

async function createSchema(uow: SqliteUnitOfWork) {
    console.log('CREATE SCHEMA');
    await uow.query(
        `CREATE TABLE state (
                    uf CHARACTER(2) PRIMARY KEY
                );`);
    await uow.query(
        `CREATE TABLE city (
                    ibge_id INTEGER PRIMARY KEY,
                    uf CHARACTER(2),
                    name VARCHAR(255),
                    FOREIGN KEY(uf) REFERENCES state(uf)
                );`);
    await uow.query(
        `CREATE TABLE user (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email VARCHAR(255) UNIQUE,
                    name VARCHAR(128),
                    password_hash CHARACTER(64)
            );`);
    await uow.query(
        `CREATE TABLE user_address (
                    user_id INTEGER,
                    street VARCHAR(255),
                    number INTEGER NULL,
                    city_id INTEGER,
                    FOREIGN KEY(city_id) REFERENCES city(ibge_id),
                    FOREIGN KEY(user_id) REFERENCES user(id)
            );`);
}