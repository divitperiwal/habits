import redis from "@/config/redis.config";
import { ApiError } from "@/utils/response/error";
import type { NextFunction, Request, Response } from "express";

export const createRateLimiter = (windowSeconds: number, maxRequests: number) => {

    return async (req: Request, _: Response, next: NextFunction) => {
        if (process.env.NODE_ENV === "development") return next();
        const ip = req.ip;
        const key = `rate-limit:${ip}`;

        const requests = await redis.incr(key);

        if (requests === 1) await redis.expire(key, windowSeconds);

        if (requests > maxRequests) throw new ApiError(`Too many requests. Please try again later.`, 429);

        next();

    };
};

export const apiRateLimiter = createRateLimiter(Number(process.env.API_RATE_LIMIT_WINDOW_SECONDS) || 60, Number(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100);

export const authRateLimiter = createRateLimiter(Number(process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS) || 15 * 60, Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 25);
