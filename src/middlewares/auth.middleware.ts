import { asyncHandler } from '@/utils/response/async';
import { ApiError } from '@/utils/response/error';
import { verifyToken } from '@/utils/security/jwt';
import type { Request, Response, NextFunction } from 'express';

export const AuthMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) throw new ApiError('Unauthorized: No token provided', 401);

    const token = authHeader.split(' ')[1];
    if (!token) throw new ApiError('Unauthorized: No token provided', 401);

    const payload = await verifyToken(token);


    //Implement token blacklist check through redis later
    // if (await isTokenBlacklist(token)) throw new ApiError('Unauthorized: Token is blacklisted', 401);

    req.user = { id: payload.id, email: payload.email };
    next();
})