import { afterAll } from "bun:test";
import { db, pool } from "@/config/database.config";
import { habits, trackingLogs, users } from "@/database/schema";
import { ensureServer } from "./setup";
import redis from "@/config/redis.config";


export const cleanDb = async () => {
    await redis.flushall();
    await db.delete(trackingLogs);
    await db.delete(habits);
    await db.delete(users);
};

export const apiRequest = async ( method: string, path: string, body?: unknown, token?: string) => {
    const url = `${await ensureServer()}${path}`;
    const headers: Record<string, string> = {};

    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const responseBody = await response.json() as any;

    return {
        status: response.status,
        body: responseBody,
    };
};

export const uniqueEmail = (prefix = "user") => {
    return `${prefix}-${crypto.randomUUID()}@example.com`;
};

export const registerUser = async (prefix = "user") => {
    const response = await apiRequest("POST", "/api/v1/auth/register", {
        name: "Test User",
        email: uniqueEmail(prefix),
        password: "password123",
    });

    return {
        response,
        token: response.body.data.token as string,
        user: response.body.data.user,
    };
};

export const createHabit = async (token: string, overrides: Record<string, unknown> = {}) => {
    const response = await apiRequest("POST", "/api/v1/habits", {
        name: "Read",
        ...overrides,
    }, token);

    return {
        response,
        habit: response.body.data,
    };
};

