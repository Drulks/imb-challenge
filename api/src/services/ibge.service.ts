import axios, { AxiosInstance } from "axios";
import CONFIG from "../config";

type IBGEState = { id: number, sigla: string, nome: string }
type IBGECity = {
    id: number, nome: string,
    municipio: {
        microrregiao: { mesorregiao: { UF: IBGEState } };
    }
}

export default class IBGEService {
    private httpClient: AxiosInstance;
    constructor() {
        this.httpClient = axios.create({ baseURL: CONFIG.API_IBGE });
    }

    getStates() {
        return this.httpClient.get<IBGEState[]>('/localidades/estados')
            .then(res => res.data.map(state => ({ UF: state.sigla, name: state.nome })));
    }

    getCitiesFromUF(uf: string) {
        return this.httpClient.get<IBGECity[]>(`/localidades/estados/${uf}/distritos`)
            .then(res => res.data.map(city => ({ id: city.id, name: city.nome })));
    }

    getCity(id: number) {
        return this.httpClient.get<IBGECity[]>(`/localidades/distritos/${id}`)
            .then(res => res.data[0])
            .then(city => ({
                id: city.id,
                name: city.nome,
                UF: city.municipio.microrregiao.mesorregiao.UF.sigla
            }));
    }

}