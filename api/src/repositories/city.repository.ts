import City from "../models/city.model";
import SqliteRepository from "./base/sqlite.repository";
import StateRepository from "./state.repository";

export default class CityRepository extends SqliteRepository {
    static get nomeTabela() { return 'city'; }
    static mapToModel(obj: { ibge_id: number, uf: string, name: string }) {
        return new City({
            ibgeId: obj.ibge_id,
            UF: obj.uf,
            name: obj.name
        });
    }

    constructor(
        repository?: SqliteRepository,
        private IStateRepository = StateRepository,
    ) {
        super(repository);
    }

    async save(city: City) {
        try {
            await this._saveCity(city);
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                await new (this.IStateRepository)(this).save(city.UF);
                await this._saveCity(city);
            } else {
                throw error;
            }
        }
    }
    private _saveCity(city: City) {
        return this.uow.query(
            `INSERT INTO ${this.ownRef.nomeTabela}(ibge_id, uf, name) VALUES(?,?,?)`,
            [city.ibgeId, city.UF, city.name]
        );
    }
}