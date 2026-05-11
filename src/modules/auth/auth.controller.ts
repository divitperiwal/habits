import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.validation';
import { AuthService } from './auth.service';
import { sendSuccess } from '@/utils/response/response';
import { asyncHandler } from '@/utils/response/async';

export const AuthController = {
    login: asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = loginSchema.parse(req.body);
        const { token, user } = await AuthService.login(email, password);
        sendSuccess(res, 200, "User logged in successfully", { token, user });
    }),
    
    register: asyncHandler(async (req: Request, res: Response) => {
        const { name, email, password } = registerSchema.parse(req.body);
        const { token, user } = await AuthService.register(name, email, password);
        sendSuccess(res, 201, "User registered successfully", { token, user });
    }),

    logout: asyncHandler(async (req: Request, res: Response) => {
        const token = req.headers.authorization?.split(' ')[1];
        await AuthService.logout(token!);
        sendSuccess(res, 200, "User logged out successfully");
    })
}
