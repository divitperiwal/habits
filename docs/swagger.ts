import type { Express, Request, Response } from 'express';

const openApiDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Habit Tracker API',
        version: '1.0.0',
        description: 'Simple API docs for auth, habits, and tracking.',
    },
    servers: [{ url: 'http://localhost:8000', description: 'Local server' }],
    tags: [{ name: 'Health' }, { name: 'Auth' }, { name: 'Habits' }, { name: 'Tracking' }],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            ApiError: {
                type: 'object',
                required: ['success', 'statusCode', 'message'],
                properties: {
                    success: { type: 'boolean', example: false },
                    statusCode: { type: 'number', example: 400 },
                    message: { type: 'string', example: 'Bad Request' },
                    errors: {
                        oneOf: [
                            { type: 'object' },
                            { type: 'array', items: { type: 'object' } },
                            { type: 'string' },
                        ],
                    },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', example: '7a0b7d56-f4a0-42fb-950e-3de16518409d' },
                    email: { type: 'string', format: 'email', example: 'divit@example.com' },
                    createdAt: { type: 'string', format: 'date-time', example: '2026-05-12T08:00:00.000Z' },
                },
            },
            Habit: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', example: '2b3a5e18-d1af-4ac6-a508-4587f45342c1' },
                    userId: { type: 'string', format: 'uuid', example: '7a0b7d56-f4a0-42fb-950e-3de16518409d' },
                    name: { type: 'string', example: 'Drink Water' },
                    description: { type: 'string', nullable: true, example: 'Drink 8 glasses of water' },
                    frequency: { type: 'string', enum: ['daily', 'weekly'], example: 'daily' },
                    tags: { type: 'array', items: { type: 'string' }, example: ['health'] },
                    reminderTime: { type: 'string', nullable: true, example: '09:00' },
                    deletedAt: { type: 'string', format: 'date-time', nullable: true, example: null },
                    createdAt: { type: 'string', format: 'date-time', example: '2026-05-12T08:00:00.000Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2026-05-12T08:00:00.000Z' },
                },
            },
            TrackingLog: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', example: '901e9c08-486f-43d9-87a1-b521e80d6a0a' },
                    habitId: { type: 'string', format: 'uuid', example: '2b3a5e18-d1af-4ac6-a508-4587f45342c1' },
                    userId: { type: 'string', format: 'uuid', example: '7a0b7d56-f4a0-42fb-950e-3de16518409d' },
                    date: { type: 'string', format: 'date', example: '2026-05-12' },
                    note: { type: 'string', nullable: true, example: 'Completed after breakfast' },
                    createdAt: { type: 'string', format: 'date-time', example: '2026-05-12T08:00:00.000Z' },
                },
            },
            StatsResponse: {
                type: 'object',
                properties: {
                    currentStreak: { type: 'number', example: 5 },
                    longestStreak: { type: 'number', example: 12 },
                    completionRate: { type: 'number', example: 83 },
                },
            },
            HistoryItem: {
                type: 'object',
                properties: {
                    date: { type: 'string', format: 'date', example: '2026-05-12' },
                    completed: { type: 'boolean', example: true },
                    note: { type: 'string', example: 'Completed after breakfast' },
                },
            },
            Pagination: {
                type: 'object',
                properties: {
                    page: { type: 'number', example: 1 },
                    limit: { type: 'number', example: 10 },
                    total: { type: 'number', example: 1 },
                    totalPages: { type: 'number', example: 1 },
                },
            },
            AuthData: {
                type: 'object',
                properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: { $ref: '#/components/schemas/User' },
                },
            },
            HabitListData: {
                type: 'object',
                properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Habit' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                },
            },
            RegisterInput: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string', example: 'Divit' },
                    email: { type: 'string', format: 'email', example: 'divit@example.com' },
                    password: { type: 'string', minLength: 6, maxLength: 72, example: 'password123' },
                },
            },
            LoginInput: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'divit@example.com' },
                    password: { type: 'string', minLength: 6, maxLength: 72, example: 'password123' },
                },
            },
            HabitInput: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', example: 'Drink Water' },
                    description: { type: 'string', example: 'Drink 8 glasses of water' },
                    frequency: { type: 'string', enum: ['daily', 'weekly'], example: 'daily' },
                    tags: { type: 'array', items: { type: 'string' }, example: ['health'] },
                    reminderTime: { type: 'string', pattern: '^([0-1]\\d|2[0-3]):[0-5]\\d$', example: '09:00' },
                },
            },
            HabitUpdateInput: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'Drink Water' },
                    description: { type: 'string', example: 'Drink 10 glasses of water' },
                    frequency: { type: 'string', enum: ['daily', 'weekly'], example: 'daily' },
                    tags: { type: 'array', items: { type: 'string' }, example: ['health'] },
                    reminderTime: { type: 'string', pattern: '^([0-1]\\d|2[0-3]):[0-5]\\d$', example: '09:00' },
                },
            },
            TrackHabitInput: {
                type: 'object',
                properties: {
                    note: { type: 'string', maxLength: 255, example: 'Completed after breakfast' },
                },
            },
            MessageResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Success' },
                },
            },
            AuthResponse: {
                allOf: [
                    { $ref: '#/components/schemas/MessageResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/AuthData' } } },
                ],
            },
            HabitResponse: {
                allOf: [
                    { $ref: '#/components/schemas/MessageResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/Habit' } } },
                ],
            },
            HabitListResponse: {
                allOf: [
                    { $ref: '#/components/schemas/MessageResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/HabitListData' } } },
                ],
            },
            StatsApiResponse: {
                allOf: [
                    { $ref: '#/components/schemas/MessageResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/StatsResponse' } } },
                ],
            },
            TrackingLogResponse: {
                allOf: [
                    { $ref: '#/components/schemas/MessageResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/TrackingLog' } } },
                ],
            },
            HistoryResponse: {
                allOf: [
                    { $ref: '#/components/schemas/MessageResponse' },
                    {
                        type: 'object',
                        properties: {
                            data: { type: 'array', items: { $ref: '#/components/schemas/HistoryItem' } },
                        },
                    },
                ],
            },
        },
        parameters: {
            HabitId: {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string', format: 'uuid' },
            },
        },
        responses: {
            BadRequest: {
                description: 'Invalid request',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ApiError' },
                        examples: {
                            validation: {
                                summary: 'Validation error',
                                value: {
                                    success: false,
                                    statusCode: 400,
                                    message: 'Validation Error',
                                    errors: [{ field: 'body', message: 'Invalid input' }],
                                },
                            },
                            invalidToken: {
                                summary: 'Invalid logout token',
                                value: { success: false, statusCode: 400, message: 'Invalid token' },
                            },
                            emptyUpdate: {
                                summary: 'Empty habit update',
                                value: { success: false, statusCode: 400, message: 'No data provided for update' },
                            },
                        },
                    },
                },
            },
            UnauthorizedError: {
                description: 'Unauthorized bearer token',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ApiError' },
                        examples: {
                            noToken: {
                                summary: 'No bearer token',
                                value: { success: false, statusCode: 401, message: 'Unauthorized: No token provided' },
                            },
                            blacklisted: {
                                summary: 'Logged out token',
                                value: { success: false, statusCode: 401, message: 'Unauthorized: Token is blacklisted' },
                            },
                        },
                    },
                },
            },
            InvalidCredentials: {
                description: 'Invalid login credentials',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ApiError' },
                        example: { success: false, statusCode: 401, message: 'Invalid email or password' },
                    },
                },
            },
            NotFound: {
                description: 'Not found',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ApiError' },
                        example: { success: false, statusCode: 404, message: 'Route Not Found' },
                    },
                },
            },
            HabitNotFound: {
                description: 'Habit not found',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ApiError' },
                        example: { success: false, statusCode: 404, message: 'Habit not found' },
                    },
                },
            },
            Conflict: {
                description: 'Conflict',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ApiError' },
                        examples: {
                            userExists: {
                                summary: 'User already exists',
                                value: { success: false, statusCode: 409, message: 'User already exists' },
                            },
                            alreadyTracked: {
                                summary: 'Habit already tracked today',
                                value: { success: false, statusCode: 409, message: 'Habit already tracked for today' },
                            },
                        },
                    },
                },
            },
        },
    },
    paths: {
        '/': {
            get: {
                tags: ['Health'],
                summary: 'Welcome message',
                responses: {
                    200: {
                        description: 'API welcome response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' },
                                example: { success: true, statusCode: 200, message: 'Welcome to the Habit Tracker API' },
                            },
                        },
                    },
                },
            },
        },
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Health check',
                responses: {
                    200: {
                        description: 'Server is healthy',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' },
                                example: {
                                    success: true,
                                    statusCode: 200,
                                    message: 'Server is healthy',
                                    data: { timestamp: '2026-05-12T08:00:00.000Z' },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a user',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } },
                responses: {
                    201: {
                        description: 'User registered',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthResponse' },
                                example: {
                                    success: true,
                                    statusCode: 201,
                                    message: 'User registered successfully',
                                    data: {
                                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                        user: {
                                            id: '7a0b7d56-f4a0-42fb-950e-3de16518409d',
                                            email: 'divit@example.com',
                                            createdAt: '2026-05-12T08:00:00.000Z',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    409: { $ref: '#/components/responses/Conflict' },
                },
            },
        },
        '/api/v1/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Log in a user',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } },
                responses: {
                    200: {
                        description: 'User logged in',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthResponse' },
                                example: {
                                    success: true,
                                    statusCode: 200,
                                    message: 'User logged in successfully',
                                    data: {
                                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                        user: {
                                            id: '7a0b7d56-f4a0-42fb-950e-3de16518409d',
                                            email: 'divit@example.com',
                                            createdAt: '2026-05-12T08:00:00.000Z',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/InvalidCredentials' },
                },
            },
        },
        '/api/v1/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Log out the current user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'User logged out',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' },
                                example: { success: true, statusCode: 200, message: 'User logged out successfully' },
                            },
                        },
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/UnauthorizedError' },
                },
            },
        },
        '/api/v1/habits': {
            get: {
                tags: ['Habits'],
                summary: 'List habits',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'tag', in: 'query', schema: { type: 'string' } },
                    { name: 'page', in: 'query', schema: { type: 'number', minimum: 1, default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'number', minimum: 1, maximum: 20, default: 10 } },
                ],
                responses: {
                    200: {
                        description: 'Habits retrieved',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/HabitListResponse' },
                                example: {
                                    success: true,
                                    statusCode: 200,
                                    message: 'Habits retrieved successfully',
                                    data: {
                                        data: [
                                            {
                                                id: '2b3a5e18-d1af-4ac6-a508-4587f45342c1',
                                                userId: '7a0b7d56-f4a0-42fb-950e-3de16518409d',
                                                name: 'Drink Water',
                                                description: 'Drink 8 glasses of water',
                                                frequency: 'daily',
                                                tags: ['health'],
                                                reminderTime: '09:00',
                                                deletedAt: null,
                                                createdAt: '2026-05-12T08:00:00.000Z',
                                                updatedAt: '2026-05-12T08:00:00.000Z',
                                            },
                                        ],
                                        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
                                    },
                                },
                            },
                        },
                    },
                    401: { $ref: '#/components/responses/UnauthorizedError' },
                },
            },
            post: {
                tags: ['Habits'],
                summary: 'Create a habit',
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/HabitInput' } } } },
                responses: {
                    201: {
                        description: 'Habit created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/HabitResponse' },
                                example: {
                                    success: true,
                                    statusCode: 201,
                                    message: 'Habit created successfully',
                                    data: {
                                        id: '2b3a5e18-d1af-4ac6-a508-4587f45342c1',
                                        userId: '7a0b7d56-f4a0-42fb-950e-3de16518409d',
                                        name: 'Drink Water',
                                        description: 'Drink 8 glasses of water',
                                        frequency: 'daily',
                                        tags: ['health'],
                                        reminderTime: '09:00',
                                        deletedAt: null,
                                        createdAt: '2026-05-12T08:00:00.000Z',
                                        updatedAt: '2026-05-12T08:00:00.000Z',
                                    },
                                },
                            },
                        },
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/UnauthorizedError' },
                },
            },
        },
        '/api/v1/habits/{id}': {
            get: {
                tags: ['Habits'],
                summary: 'Get one habit',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/HabitId' }],
                responses: {
                    200: {
                        description: 'Habit retrieved',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/HabitResponse' },
                                example: {
                                    success: true,
                                    statusCode: 200,
                                    message: 'Habit retrieved successfully',
                                    data: {
                                        id: '2b3a5e18-d1af-4ac6-a508-4587f45342c1',
                                        userId: '7a0b7d56-f4a0-42fb-950e-3de16518409d',
                                        name: 'Drink Water',
                                        description: 'Drink 8 glasses of water',
                                        frequency: 'daily',
                                        tags: ['health'],
                                        reminderTime: '09:00',
                                        deletedAt: null,
                                        createdAt: '2026-05-12T08:00:00.000Z',
                                        updatedAt: '2026-05-12T08:00:00.000Z',
                                    },
                                },
                            },
                        },
                    },
                    401: { $ref: '#/components/responses/UnauthorizedError' },
                    404: { $ref: '#/components/responses/HabitNotFound' },
                },
            },
            put: {
                tags: ['Habits'],
                summary: 'Update a habit',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/HabitId' }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/HabitUpdateInput' } } } },
                responses: {
                    200: {
                        description: 'Habit updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/HabitResponse' },
                                example: {
                                    success: true,
                                    statusCode: 200,
                                    message: 'Habit updated successfully',
                                    data: {
                                        id: '2b3a5e18-d1af-4ac6-a508-4587f45342c1',
                                        userId: '7a0b7d56-f4a0-42fb-950e-3de16518409d',
                                        name: 'Drink Water',
                                        description: 'Drink 10 glasses of water',
                                        frequency: 'daily',
                                        tags: ['health'],
                                        reminderTime: '09:00',
                                        deletedAt: null,
                                        createdAt: '2026-05-12T08:00:00.000Z',
                                        updatedAt: '2026-05-12T08:00:00.000Z',
                                    },
                                },
                            },
                        },
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/UnauthorizedError' },
                    404: { $ref: '#/components/responses/HabitNotFound' },
                },
            },
            delete: {
                tags: ['Habits'],
                summary: 'Delete a habit',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/HabitId' }],
                responses: {
                    200: {
                        description: 'Habit deleted',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' },
                                example: { success: true, statusCode: 200, message: 'Habit deleted successfully' },
                            },
                        },
                    },
                    401: { $ref: '#/components/responses/UnauthorizedError' },
                    404: { $ref: '#/components/responses/HabitNotFound' },
                },
            },
        },
        '/api/v1/habits/{id}/stats': {
            get: {
                tags: ['Habits'],
                summary: 'Get habit stats',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/HabitId' }],
                responses: {
                    200: {
                        description: 'Habit stats retrieved',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StatsApiResponse' },
                                example: {
                                    success: true,
                                    statusCode: 200,
                                    message: 'Habit stats retrieved successfully',
                                    data: { currentStreak: 5, longestStreak: 12, completionRate: 83 },
                                },
                            },
                        },
                    },
                    401: { $ref: '#/components/responses/UnauthorizedError' },
                    404: { $ref: '#/components/responses/HabitNotFound' },
                },
            },
        },
        '/api/v1/habits/{id}/track': {
            post: {
                tags: ['Tracking'],
                summary: 'Track a habit for today',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/HabitId' }],
                requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/TrackHabitInput' } } } },
                responses: {
                    201: {
                        description: 'Habit tracked',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TrackingLogResponse' },
                                example: {
                                    success: true,
                                    statusCode: 201,
                                    message: 'Habit tracked successfully',
                                    data: {
                                        id: '901e9c08-486f-43d9-87a1-b521e80d6a0a',
                                        habitId: '2b3a5e18-d1af-4ac6-a508-4587f45342c1',
                                        userId: '7a0b7d56-f4a0-42fb-950e-3de16518409d',
                                        date: '2026-05-12',
                                        note: 'Completed after breakfast',
                                        createdAt: '2026-05-12T08:00:00.000Z',
                                    },
                                },
                            },
                        },
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/UnauthorizedError' },
                    404: { $ref: '#/components/responses/HabitNotFound' },
                    409: { $ref: '#/components/responses/Conflict' },
                },
            },
        },
        '/api/v1/habits/{id}/history': {
            get: {
                tags: ['Tracking'],
                summary: 'Get habit tracking history',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/HabitId' },
                    { name: 'days', in: 'query', schema: { type: 'number', minimum: 1, maximum: 30, default: 7 } },
                ],
                responses: {
                    200: {
                        description: 'History retrieved',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/HistoryResponse' },
                                example: {
                                    success: true,
                                    statusCode: 200,
                                    message: 'History retrieved successfully',
                                    data: [
                                        { date: '2026-05-12', completed: true, note: 'Completed after breakfast' },
                                        { date: '2026-05-11', completed: false },
                                    ],
                                },
                            },
                        },
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/UnauthorizedError' },
                    404: { $ref: '#/components/responses/HabitNotFound' },
                },
            },
        },
    },
};

const swaggerHtml = `<!doctype html>
<html>
  <head>
    <title>Habit Tracker API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({ url: '/docs/openapi.json', dom_id: '#swagger-ui' });
    </script>
  </body>
</html>`;

export const setupSwagger = (app: Express) => {
    app.get('/docs/openapi.json', (_: Request, res: Response) => {
        res.json(openApiDocument);
    });

    app.get('/docs', (_: Request, res: Response) => {
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data:");
        res.type('html').send(swaggerHtml);
    });
};
