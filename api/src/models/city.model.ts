export default class City {
    ibgeId: number
    name: string
    UF: string

    constructor(obj: Readonly<City>) {
        this.ibgeId = obj.ibgeId;
        this.name = obj.name;
        this.UF = obj.UF.toUpperCase();
    }
}