import SqliteUnitOfWork from "../../lib/sqlite.unit-of-work";

export default abstract class SqliteRepository {
    static get nomeTabela(): string {
        throw new Error("Method not implemented.");
    }
    static mapToModel(obj: any): any {
        throw new Error("Method not implemented.");
    }

    get ownRef() {
        return this.constructor as typeof SqliteRepository;
    }

    protected uow: SqliteUnitOfWork;

    constructor(repository?: SqliteRepository) {
        this.uow = repository ? repository.uow : new SqliteUnitOfWork();
    }
}