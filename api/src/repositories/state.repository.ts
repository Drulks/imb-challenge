import Address from "../models/address.model";
import SqliteRepository from "./base/sqlite.repository";

export default class StateRepository extends SqliteRepository {
    static get nomeTabela() { return 'state'; }

    async save(uf: string) {
        await this.uow.query(`INSERT INTO ${this.ownRef.nomeTabela}(uf) VALUES(?)`, [uf]);
    }
}