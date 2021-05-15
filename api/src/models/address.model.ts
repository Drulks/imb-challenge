import City from "./city.model";

export default class Address {
    city: City
    street: string
    number?: number
    constructor(obj: Readonly<Address>) {
        this.city = obj.city;
        this.street = obj.street;
        this.number = obj.number;
    }
}