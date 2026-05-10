import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.validation';
import { AuthService } from './auth.service';
import { sendSuccess } from '@/utils/response/response';

export const AuthController = {
    login: async (req: Request, res: Response) => {
        const { email, password } = loginSchema.parse(req.body);
        const { token, user } = await AuthService.login(email, password);
        sendSuccess(res, 200, "User logged in successfully", { token, user });

    },
    register: async (req: Request, res: Response) => {
        const { name, email, password } = registerSchema.parse(req.body);
        const { token, user } = await AuthService.register(name, email, password);
        sendSuccess(res, 201, "User registered successfully", { token, user });

    },
    logout: async (req: Request, res: Response) => {
        await AuthService.logout();
        sendSuccess(res, 200, "User logged out successfully");
    }
}