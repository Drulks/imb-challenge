import { FastifyPluginCallback } from "fastify";
import IBGEService from "../services/ibge.service";

const placesControllerRegister: FastifyPluginCallback = function (server, opts, done) {
    const ibgeService = new IBGEService();

    server.get('/states', async (req, res) => {
        const data = await ibgeService.getStates();
        res.send(data);
    });

    server.get('/states/:uf/cities', async (req, res) => {
        const uf = (req.params as { uf: string }).uf
        const data = await ibgeService.getCitiesFromUF(uf);
        res.send(data);
    });

    done();
}


export default placesControllerRegister;