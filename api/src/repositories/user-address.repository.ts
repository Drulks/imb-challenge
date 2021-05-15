import Address from "../models/address.model";
import City from "../models/city.model";
import SqliteRepository from "./base/sqlite.repository";
import CityRepository from "./city.repository";

export default class UserAddressRepository extends SqliteRepository {
    static get nomeTabela() { return 'user_address'; }
    static mapToModel(obj: any) {
        return new Address({
            street: obj.street,
            number: obj.number,
            city: new City({ ibgeId: obj.city_id, UF: obj.uf, name: obj.name })
        });
    }

    get ownRef() {
        return this.constructor as typeof UserAddressRepository;
    }

    constructor(
        repository?: SqliteRepository,
        private ICityRepository = CityRepository,
    ) {
        super(repository);
    }
    async get(userId: number) {
        return await this.uow.query(`SELECT addr.*, c.uf, c.name FROM ${this.ownRef.nomeTabela} addr \
            LEFT JOIN ${this.ICityRepository.nomeTabela} c ON addr.city_id = c.ibge_id
         WHERE user_id = ?`, [userId])
            .then(results => results[0])
            .then(result => result ? this.ownRef.mapToModel(result) : undefined)
    }
    async save(userId: number, address: Address) {
        try {
            await this._saveAddress(userId, address)
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                await new (this.ICityRepository)(this).save(address.city);
                await this._saveAddress(userId, address);
            }
        }
    }
    private _saveAddress(userId: number, address: Address) {
        return this.uow.query(
            `INSERT INTO ${this.ownRef.nomeTabela}(user_id, street, number, city_id) VALUES(?,?,?,?)`,
            [userId, address.street, address.number, address.city.ibgeId]
        );
    }
}