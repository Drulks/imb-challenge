import { FastifyPluginCallback } from "fastify";
import getUserHandle from "../middleware/get-user.handle";
import Pet from "../models/pet.model";
import User from "../models/user.model";
import PetService from "../services/pet.service";

const petsControllerRegister: FastifyPluginCallback = function (server, opts, done) {
    const petService = new PetService();

    server.get('/species', async (req, res) => {
        res.send(await petService.getSpecies());
    });
    
    server.get('/species/:specieId/breeds', async (req, res) => {
        const params = req.params as { specieId: number }
        const query = req.query as { name?: string }
        res.send(await petService.getBreeds(params.specieId, { name: query.name }))
    });

    server.get('/', async (req, res) => {
        const query = req.query as { specieId?: number, cityId?: number, breedId?: number, page?: number, limit?: number }
        const result = await petService.getPets({
            cityId: query.cityId,
            petBreedId: query.breedId, petSpecieId: query.specieId,
            page: query.page, limit: query.limit
        })
        res.send(result);
    });

    server.post('/', { preHandler: getUserHandle(true) }, async (req, res) => {
        const pet = req.body as Pet;
        res.send(await petService.save(pet, req.user as User));
    });

    done();
}


export default petsControllerRegister;