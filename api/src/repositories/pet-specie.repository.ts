import PetSpecie from "../models/pet-specie.model";
import SqliteRepository from "./base/sqlite.repository";

export default class PetSpecieRepository extends SqliteRepository {
    static get nomeTabela() { return 'pet_specie'; }

    getAll() {
        return this.uow.query(`SELECT id, name FROM ${this.ownRef.nomeTabela}`)
            .then(results => results.map(result => new PetSpecie(result)));
    }
}