import Address from "./address.model";

export default class User {
    id?: number
    name: string
    email: string
    address?: Address

    constructor(obj: Readonly<User>) {
        this.id = obj.id;
        this.name = obj.name;
        this.email = obj.email;
        this.address = obj.address;
    }
}