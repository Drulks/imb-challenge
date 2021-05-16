export default class PetSpecie {
    id: number
    name?: string
    constructor(obj: Readonly<PetSpecie>) {
        this.id = obj.id;
        this.name = obj.name;
    }
}