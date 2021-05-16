import * as path from 'path';
import { promises as fs } from 'fs';
import { Database } from "sqlite3";

import SqliteUnitOfWork from "../src/lib/sqlite.unit-of-work";
import { F_OK } from 'constants';
import CONFIG from '../src/config';

export default async function initSqlite() {
    const dbPath = path.resolve(__dirname, '_.db');
    const isCreated = await fs.access(dbPath, F_OK)
        .then(() => true)
        .catch(() => false);

    if (CONFIG.BD_BOOTSTRAP_MODE === 'WIPE_AND_CREATE' && isCreated) {
        await fs.rm(dbPath);
    }

    const db = await new Promise<Database>((resolve, reject) => {
        const database = new Database(dbPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(database);
            }
        });
    })

    const uow = new SqliteUnitOfWork(true, false, db);
    await uow.query('PRAGMA foreign_keys = ON');
    if (
        CONFIG.BD_BOOTSTRAP_MODE === 'WIPE_AND_CREATE' ||
        !isCreated && CONFIG.BD_BOOTSTRAP_MODE === 'CREATE_IF_NOT_EXISTS'
    ) {
        await createSchema(uow);
    }

    return db;
}

async function createSchema(uow: SqliteUnitOfWork) {
    console.log('----------------------------');
    console.log('CREATE SCHEMA');
    await uow.query(`CREATE TABLE state (
                        uf CHARACTER(2) PRIMARY KEY
                    );`).then(() => console.log('Created table state'));
    await uow.query(`CREATE TABLE city (
                        ibge_id INTEGER PRIMARY KEY,
                        uf CHARACTER(2),
                        name VARCHAR(255),
                        FOREIGN KEY(uf) REFERENCES state(uf)
                    );`).then(() => console.log('Created table city'));
    await uow.query(`CREATE TABLE user (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        email VARCHAR(255) UNIQUE,
                        name VARCHAR(128),
                        password_hash CHARACTER(64)
                    );`).then(() => console.log('Created table user'));
    await uow.query(`CREATE TABLE user_address (
                        user_id INTEGER,
                        street VARCHAR(255),
                        number INTEGER NULL,
                        city_id INTEGER,
                        FOREIGN KEY(city_id) REFERENCES city(ibge_id),
                        FOREIGN KEY(user_id) REFERENCES user(id)
                    );`).then(() => console.log('Created table user_address'));
    await uow.query(`CREATE TABLE pet_specie (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name VARCHAR(64)
                    );`).then(() => console.log('Created table pet_specie'));
    await uow.query(`INSERT INTO pet_specie(name) VALUES('Cachorro'),('Gato');`);
    await uow.query(`CREATE TABLE pet_breed(
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        pet_specie_id INTEGER,
                        name VARCHAR(64),
                        FOREIGN KEY(pet_specie_id) REFERENCES pet_specie(id)
                    );`).then(() => console.log('Created table pet_breed'));
    await uow.query(`CREATE TABLE pet (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name VARCHAR(64),
                        pet_breed_id INTEGER,
                        pet_specie_id INTEGER,
                        city_id INTEGER,
                        registered_by INTEGER,
                        FOREIGN KEY(pet_breed_id) REFERENCES pet_breed(id),
                        FOREIGN KEY(pet_specie_id) REFERENCES pet_breed(pet_specie_id),
                        FOREIGN KEY(city_id) REFERENCES city(ibge_id),
                        FOREIGN KEY(registered_by) REFERENCES user(id)
                    );`).then(() => console.log('Created table pet'));
    console.log('----------------------------');
}

/**
 * CREATE TABLE user (
    id integer PRIMARY KEY AUTOINCREMENT,
    email varchar,
    name varchar,
    password_hash string
);

CREATE TABLE user_address (
    city_id integer,
    user_id integer,
    street varchar,
    number integer
);

CREATE TABLE state (
    UF string
);

CREATE TABLE city (
    ibge_id integer,
    UF string,
    name varchar
);

CREATE TABLE pet_specie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(64),
);

CREATE TABLE pet_breed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_specie_id INTEGER,
    name VARCHAR(64),
    FOREIGN KEY(pet_specie_id) REFERENCES pet_specie(id)
);

CREATE TABLE pet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(64),
    pet_breed_id INTEGER,
    pet_specie_id INTEGER,
    city_id INTEGER,
    registered_by INTEGER,
    FOREIGN KEY(pet_breed_id) REFERENCES pet_breed(id),
    FOREIGN KEY(pet_specie_id) REFERENCES pet_breed(pet_specie_id),
    FOREIGN KEY(city_id) REFERENCES city(ibge_id),
    FOREIGN KEY(registered_by) REFERENCES user(id)
);
 */