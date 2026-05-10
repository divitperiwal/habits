import type { SuccessResponse, ErrorResponse } from '@/types/common';
import type { Response } from 'express';

export const sendSuccess = (res: Response, statusCode = 200, message = 'Success', data?: any) => {
    const response: SuccessResponse = { success: true, statusCode, message, };
    if (data) response.data = data;

    return res.status(statusCode).json(response);
};

export const sendError = (res: Response, statusCode = 500, message = 'Internal Server Error', errors?: any) => {
    const response: ErrorResponse = {success: false,statusCode,message,};
    if (errors) response.errors = errors;

    return res.status(statusCode).json(response);
};