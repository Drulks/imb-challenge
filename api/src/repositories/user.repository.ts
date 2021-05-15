import Address from "../models/address.model";
import User from "../models/user.model";
import SqliteRepository from "./base/sqlite.repository";
import UserAddressRepository from "./user-address.repository";

export default class UserRepository extends SqliteRepository {
    static get nomeTabela() { return 'user'; }
    static mapToModel(obj: any) {
        return new User({
            id: obj.id,
            email: obj.email,
            address: obj.address,
            name: obj.name
        });
    }
    get ownRef() {
        return this.constructor as typeof UserRepository;
    }

    constructor(
        repository?: SqliteRepository,
        private IUserAddressRepository = UserAddressRepository,
    ) {
        super(repository);
    }

    async save(user: User, passwordToken: string) {
        this.uow.autocommit = false;
        const userAddressRepository = new (this.IUserAddressRepository)(this);

        await this.uow.query(
            `INSERT INTO ${this.ownRef.nomeTabela}(email, name, password_hash) VALUES(?,?,?)`,
            [user.email, user.name, passwordToken]
        ).then(result => user.id = result.lastID);
        await userAddressRepository.save(user.id as number, user.address as Address);
        console.log(user.id);
        this.uow.commit();
        return user;
    }

    get(id: number) {
        return this.uow.query(`SELECT id, email, name FROM ${this.ownRef.nomeTabela} WHERE id = ?`, [id])
            .then(results => results[0])
            .then(result => result ? this.ownRef.mapToModel(result) : undefined)
    }

    getUserAndPassword(email: string) {
        return this.uow.query(
            `SELECT id, email, name, password_hash FROM ${this.ownRef.nomeTabela} WHERE email = ?`,
            [email]
        )
            .then(results => results[0])
            .then(result => {
                if (result) {
                    return {
                        user: this.ownRef.mapToModel(result),
                        passwordHash: String(result.password_hash)
                    }
                }
            })
    }
}