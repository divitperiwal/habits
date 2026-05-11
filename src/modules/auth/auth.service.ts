import { ApiError } from "@/utils/response/error"
import { AuthRepository } from "./auth.repository";
import { hashPassword, verifyPassword } from "@/utils/security/hashing";
import { signToken } from "@/utils/security/jwt";

export const AuthService = {
    register: async (name: string, email: string, password: string) => {
        if (!name || !email || !password) throw new ApiError("Name, email and password are required", 400);
        const userExists = await AuthRepository.findUserByEmail(email);
        if (userExists) throw new ApiError("User already exists", 409);

        const passwordHash = await hashPassword(password);
        const user = await AuthRepository.createUser(name, email, passwordHash);
        if (!user) throw new ApiError("Failed to create user", 500);

        const token = await signToken(user.id, user.email);
        const userWithoutPassword = { id: user.id, email: user.email, createdAt: user.createdAt };
        return { token, user: userWithoutPassword };
    },

    login: async (email: string, password: string) => {
        if (!email || !password) throw new ApiError("Email and password are required", 400);
        const user = await AuthRepository.findUserByEmailWithPassword(email);
        if (!user) throw new ApiError("Invalid email or password", 401);

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) throw new ApiError("Invalid email or password", 401);

        const token = await signToken(user.id, user.email);
        const userWithoutPassword = { id: user.id, email: user.email, createdAt: user.createdAt };
        return { token, user: userWithoutPassword };
    },

    logout: async () => {
        //Adding Options for token blacklisting through redis
    }
}