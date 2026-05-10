import type { ApiErrorResponse } from '@/types/common';

export class ApiError extends Error {
    public statusCode: number;
    public details?: any;

    constructor(message: string, statusCode: number, details?: any) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        const response: ApiErrorResponse = {
            success: false,
            statusCode: this.statusCode,
            message: this.message,
        };

        if (process.env.NODE_ENV === 'development' && this.details) {
            response.details = this.details;
        }

        return response;
    }
}