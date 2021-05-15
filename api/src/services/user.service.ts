import * as bcrypt from 'bcrypt';

import User from "../models/user.model";
import UserAddressRepository from '../repositories/user-address.repository';
import UserRepository from "../repositories/user.repository";

export type UserExtraInfo = keyof Omit<User, "id" | "email" | "name">

export default class UserService {
    constructor(
        private IUserRepository = UserRepository,
        private IUserAddressRepository = UserAddressRepository,
    ) { }

    async getUserById(id: number, extraInfo: UserExtraInfo[] = []) {
        const userRepository = new (this.IUserRepository)();
        const user = await userRepository.get(id);
        if (user && extraInfo.length) {
            await Promise.all(extraInfo.map(async info => {
                if (info === 'address') {
                    user.address = await new (this.IUserAddressRepository)().get(user.id as number);
                }
            }));
        }
        return user;
    }

    async save(user: User, password: string) {
        const userRepository = new (this.IUserRepository)();

        const passwordToken = await bcrypt.hash(password, 10);
        return await userRepository.save(user, passwordToken);
    }

    async verifyUser(email: string, password: string) {
        const userRepository = new (this.IUserRepository)();
        const data = await userRepository.getUserAndPassword(email);
        if (data) {
            const validPassword = await bcrypt.compare(password, data.passwordHash);
            if (validPassword) {
                return data.user;
            } else {
                throw new Error('Invalid password');
            }
        }
    }
}