import App from "../src/app";
import middiePlugin from 'middie';
import fastifyCookie from 'fastify-cookie';
import authControllerRegister from "../src/controllers/auth.controller";
import { registerGetUserHandle } from "../src/middleware/get-user.handle";
import placesControllerRegister from "../src/controllers/places.controller";
import petsControllerRegister from "../src/controllers/pets.controller";

export default async function initFastify(app: App) {
    await app.serverInstance.register(middiePlugin);
    await app.serverInstance.register(fastifyCookie);

    registerGetUserHandle(app.serverInstance);

    await app.serverInstance.register(authControllerRegister, { prefix: 'auth' });
    await app.serverInstance.register(placesControllerRegister, { prefix: 'places' });
    await app.serverInstance.register(petsControllerRegister, { prefix: 'pets' });

}
