import { FastifyPluginCallback } from "fastify";
import jwt from 'jsonwebtoken';
import CONFIG from "../config";
import getUserHandle from "../middleware/get-user.handle";

import User from "../models/user.model";
import UserService from "../services/user.service";

const authControllerRegister: FastifyPluginCallback = function (instance, opts, done) {
    const userService = new UserService();

    instance.post('/register', async (req, res) => {
        const data = req.body as (User & { password: string })
        const user = await userService.save(new User(data), data.password);
        const token = await jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            CONFIG.JWT_PRIVATE_KEY,
            { expiresIn: '30m' }
        )
        res.setCookie(
            CONFIG.AUTH_COOKIENAME, token, {
            httpOnly: true,
            secure: CONFIG.PRODUCTION,
            path: '/'
        }).code(200).send()
    });

    instance.post('/authenticate', async (req, res) => {
        const data = req.body as { email: string, password: string }
        const user = await userService.verifyUser(data.email, data.password);
        if (user) {
            const token = await jwt.sign(
                { id: user.id, email: user.email, name: user.name },
                CONFIG.JWT_PRIVATE_KEY,
                { expiresIn: '30m' }
            )
            res.setCookie(
                CONFIG.AUTH_COOKIENAME, token, {
                httpOnly: true,
                secure: CONFIG.PRODUCTION,
                path: '/'
            }).code(200).send()
        } else {
            res.code(400).send('Wrong email or password')
        }
    });

    instance.get('/validate', { preHandler: [getUserHandle(true)] }, (req, res) => {
        res.send(req.user);
    });

    instance.get('/me', { preHandler: [getUserHandle(true, ['address'])] }, (req, res) => {
        res.send(req.user);
    });

    done();
}


export default authControllerRegister;