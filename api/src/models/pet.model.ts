import City from "./city.model"
import PetBreed from "./pet-breed.model"
import User from "./user.model"

export default class Pet {
    id?: number
    name: string
    breed: PetBreed
    city: City
    constructor(obj: Readonly<Pet>) {
        this.id = obj.id;
        this.name = obj.name;
        this.breed = obj.breed;
        this.city = obj.city;
    }
}