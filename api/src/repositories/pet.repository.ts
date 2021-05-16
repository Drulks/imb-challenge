import City from "../models/city.model";
import PetBreed from "../models/pet-breed.model";
import PetSpecie from "../models/pet-specie.model";
import Pet from "../models/pet.model";
import User from "../models/user.model";
import SqliteRepository from "./base/sqlite.repository";
import CityRepository from "./city.repository";
import PetBreedRepository from "./pet-breed.repository";
import PetSpecieRepository from "./pet-specie.repository";
import UserRepository from "./user.repository";

type GetAllFilter = { petSpecieId?: number, petBreedId?: number, cityId?: number, userId?: number }

export default class PetRepository extends SqliteRepository {
    static get nomeTabela() { return 'pet'; }

    constructor(
        repository?: SqliteRepository,
        private IPetBreedRepository = PetBreedRepository,
        private IPetSpecieRepository = PetSpecieRepository,
        private IUserRepository = UserRepository,
        private ICityRepository = CityRepository,
    ) {
        super(repository);
    }

    async save(pet: Pet, user: User) {
        try {
            if (!pet.breed.id) {
                pet.breed = await new (this.IPetBreedRepository)(this).save(pet.breed);
            }
            return await this._savePet(pet, user)
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                await new (this.ICityRepository)(this).save(pet.city);
                return await this._savePet(pet, user);
            }
        }
    }

    private _savePet(pet: Pet, user: User) {
        return this.uow.query(
            `INSERT INTO ${this.ownRef.nomeTabela}(name, pet_breed_id, pet_specie_id, city_id, registered_by) VALUES(?,?,?,?,?)`,
            [pet.name, pet.breed.id, pet.breed.specie.id, pet.city.ibgeId, user.id]
        ).then(result => {
            pet.id = result.lastID;
            return pet;
        })

    }

    async getAllWithPagination({ petSpecieId, petBreedId, cityId, userId, page, limit }: GetAllFilter & { page?: number, limit?: number } = {}) {
        page = page || 0;
        limit = limit ? Math.min(limit, 20) : 5;

        const conditions = [];
        const values = [];

        if (petSpecieId) {
            conditions.push('pet_specie_id = ?');
            values.push(petSpecieId);
        }
        if (petBreedId) {
            conditions.push('pet_breed_id = ?');
            values.push(petBreedId);
        }
        if (cityId) {
            conditions.push('city_id = ?');
            values.push(cityId);
        }
        if (userId) {
            conditions.push('registered_by = ?');
            values.push(userId);
        }

        let whereText = '';
        if (conditions.length) {
            whereText = `WHERE ${conditions.join(' AND ')}`;
        }

        const result = await this.uow.query(
            `SELECT p.*, \ 
                    city.uf as city_uf, city.name as city_name, \ 
                    breed.name as breed_name, \ 
                    specie.name as specie_name \ 
            FROM ${this.ownRef.nomeTabela} p \
                LEFT JOIN ${this.ICityRepository.nomeTabela} city ON p.city_id = city.ibge_id \ 
                LEFT JOIN ${this.IPetBreedRepository.nomeTabela} breed ON p.pet_breed_id = breed.id \ 
                LEFT JOIN ${this.IPetSpecieRepository.nomeTabela} specie ON breed.pet_specie_id = specie.id \ 
            ${whereText} \ 
            ORDER BY id ASC LIMIT ${limit} OFFSET ${page * limit}`,
            values
        ).then(results => results.map(result => new Pet({
            id: result.id,
            name: result.name,
            city: new City({ ibgeId: result.city_id, UF: result.city_uf, name: result.city_name }),
            breed: new PetBreed({
                id: result.pet_breed_id, name: result.specie_name,
                specie: new PetSpecie({ id: result.pet_specie_id, name: result.specie_name })
            })
        })));
        const total = await this.uow.query(`SELECT count(*) as total FROM ${this.ownRef.nomeTabela} ${whereText} ORDER BY id ASC LIMIT ${limit} OFFSET ${page * limit}`)
            .then(results => Number(results[0].total));

        return { result, pagination: { total, page, limit } };
    }


    getResposibleInfo(petId: number) {
        return this.uow.query(`SELECT u.* FROM ${this.ownRef.nomeTabela} p
            LEFT JOIN ${this.IUserRepository.nomeTabela} u ON p.registered_by = u.id
        WHERE id = ?`, [petId])
            .then(results => results[0])
            .then(result => ({ email: String(result.email), name: String(result.name) }));
    }
}