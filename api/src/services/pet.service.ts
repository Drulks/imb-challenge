import * as bcrypt from 'bcrypt';
import Pet from '../models/pet.model';

import User from "../models/user.model";
import PetBreedRepository from '../repositories/pet-breed.repository';
import PetSpecieRepository from '../repositories/pet-specie.repository';
import PetRepository from '../repositories/pet.repository';
import UserRepository from "../repositories/user.repository";
import IBGEService from './ibge.service';

export default class PetService {
    constructor(
        private IPetRepository = PetRepository,
        private IPetBreedRepository = PetBreedRepository,
        private IPetSpecieRepository = PetSpecieRepository,
        private ibgeService = new IBGEService()
    ) { }

    async getSpecies() {
        const specieRepository = new (this.IPetSpecieRepository)();
        const species = await specieRepository.getAll();
        return species;
    }

    async getBreeds(specieId: number, { name = '' } = {}) {
        const breedRepository = new (this.IPetBreedRepository)();
        const breeds = await breedRepository.getAll({ petSpecieId: specieId, name });
        return breeds;
    }

    async getPets(params: { petSpecieId?: number, petBreedId?: number, cityId?: number, userId?: number, page?: number, limit?: number } = {}) {
        const petRepository = new (this.IPetRepository)();
        const result = await petRepository.getAllWithPagination(params);
        return result;
    }

    async save(pet: Pet, user: User) {
        if (!pet.breed) { throw ReferenceError('Missing Breed'); }
        if (!pet.breed.specie) { throw ReferenceError('Missing Specie'); }
        if (!pet.city) { throw ReferenceError('Missing City'); }
        if (!pet.name) { throw ReferenceError('Missing Name'); }

        const city = await this.ibgeService.getCity(pet.city.ibgeId);
        if (city) {
            pet.city.UF = city.UF;
            pet.city.name = city.name;
        } else { throw ReferenceError('City not found'); }

        const petRepository = new (this.IPetRepository)();
        return await petRepository.save(pet, user);
    }

    async getPetCarerContact(petId:number) {
        const petRepository = new (this.IPetRepository)();
        return petRepository.getResposibleInfo(petId);
    }
}