import PetBreed from "../models/pet-breed.model";
import PetSpecie from "../models/pet-specie.model";
import SqliteRepository from "./base/sqlite.repository";

type GetAllFilter = { petSpecieId?: number, name?: string }

export default class PetBreedRepository extends SqliteRepository {
    static get nomeTabela() { return 'pet_breed'; }

    async save(breed: PetBreed) {
        return this.uow.query(`INSERT INTO ${this.ownRef.nomeTabela}(pet_specie_id, name) VALUES(?,?)`, [breed.specie.id, breed.name])
            .then(result => {
                breed.id = result.lastID;
                return breed;
            })
    }

    getAll({ petSpecieId, name }: GetAllFilter = {}) {
        const conditions = [];
        const values = [];

        if (name) { conditions.push(`name like '${name}%'`); }
        if (petSpecieId) {
            conditions.push('pet_specie_id = ?');
            values.push(petSpecieId);
        }

        let whereText = '';
        if (conditions.length) {
            whereText = `WHERE ${conditions.join(' AND ')}`;
        }

        return this.uow.query(`SELECT id, pet_specie_id, name FROM ${this.ownRef.nomeTabela} ${whereText}`, values)
            .then(results => results.map(result => new PetBreed({
                id: result.id,
                name: result.name,
                specie: new PetSpecie({ id: result.pet_specie_id })
            })));
    }
}