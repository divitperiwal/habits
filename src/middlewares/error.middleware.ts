import { ApiError } from '@/utils/response/error';
import { sendError } from '@/utils/response/response.js';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ApiError) return sendError(res, error.statusCode, error.message, error.details);

    if (error instanceof ZodError) {
        return sendError(res, 400, 'Validation Error', error.issues.map(e => ({
            field: e.path.length > 0 ? e.path.join('.') : 'body',
            message: e.message
        })))
    }

    return sendError(res, 500, 'Internal Server Error', process.env.NODE_ENV === 'development' ? error.stack : undefined,);
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    return sendError(res, 404, 'Route Not Found');
};