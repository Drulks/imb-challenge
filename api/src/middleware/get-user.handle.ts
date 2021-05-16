import { RouteHandler } from "fastify";
import User from "../models/user.model";

import jwt from "jsonwebtoken";
import CONFIG from "../config";
import UserService, { UserExtraInfo } from "../services/user.service";

import fastify = require("fastify");
// extend fastify typings
declare module "fastify" {
    interface FastifyRequest {
        user?: User
    }
}

export function registerGetUserHandle(fastifyInstance: fastify.FastifyInstance) {
    if (!fastifyInstance.hasDecorator('user')) {
        fastifyInstance.decorateRequest('user', null, ['cookies']);
    }
}


const userService = new UserService();
export default function getUserHandle(required = false, extraInfos: UserExtraInfo[] = []): RouteHandler {
    return async function (req, res) {
        const cookie = req.cookies || {}
        const authToken = cookie[CONFIG.AUTH_COOKIENAME];
        try {
            let user: User | undefined;
            if (authToken) {
                const obj = await jwt.verify(authToken, CONFIG.JWT_PRIVATE_KEY) as { id: number, email: string, name: string };
                user = await userService.getUserById(obj.id, extraInfos);
            }
            if (!user && required) { throw new Error('Needed to be logged in') }
            req.user = user;
        } catch (error) {
            res.setCookie(CONFIG.AUTH_COOKIENAME, '', { expires: new Date() }).code(401).send();
        }
    }
}