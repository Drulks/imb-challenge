import PetSpecie from "./pet-specie.model";

export default class PetBreed {
    id?: number
    name: string
    specie: PetSpecie
    constructor(obj: Readonly<PetBreed>) {
        this.id = obj.id;
        this.name = obj.name;
        this.specie = obj.specie;
    }
}