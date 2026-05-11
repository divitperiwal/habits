import { beforeAll, describe, expect, test } from "bun:test";
import { apiRequest, cleanDb, registerUser, uniqueEmail } from "../helpers";

describe("POST /api/v1/auth/register", () => {
    beforeAll(cleanDb);

    test("registers successfully, returns token and user", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/register", {
            name: "Test User",
            email: uniqueEmail("register"),
            password: "password123",
        });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(typeof response.body.data.token).toBe("string");
        expect(response.body.data.user.email).toContain("@example.com");
    });

    test("rejects duplicate email", async () => {
        const email = uniqueEmail("duplicate");

        await apiRequest("POST", "/api/v1/auth/register", {
            name: "Test User",
            email,
            password: "password123",
        });
        const response = await apiRequest("POST", "/api/v1/auth/register", {
            name: "Test User",
            email,
            password: "password123",
        });

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
    });

    test("rejects missing email", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/register", {
            name: "Test User",
            password: "password123",
        });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("rejects missing password", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/register", {
            name: "Test User",
            email: uniqueEmail("missing-password"),
        });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("rejects invalid email format", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/register", {
            name: "Test User",
            email: "not-an-email",
            password: "password123",
        });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("rejects password under 6 characters", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/register", {
            name: "Test User",
            email: uniqueEmail("short-password"),
            password: "short",
        });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});

describe("POST /api/v1/auth/login", () => {
    let email: string;

    beforeAll(async () => {
        await cleanDb();
        email = uniqueEmail("login");
        await apiRequest("POST", "/api/v1/auth/register", {
            name: "Test User",
            email,
            password: "password123",
        });
    });

    test("logs in with correct credentials, returns token and user", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/login", {
            email,
            password: "password123",
        });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(typeof response.body.data.token).toBe("string");
        expect(response.body.data.user.email).toBe(email);
    });

    test("rejects wrong password", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/login", {
            email,
            password: "wrong-password",
        });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("rejects non-existent email", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/login", {
            email: uniqueEmail("missing"),
            password: "password123",
        });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("rejects missing fields", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/login", {});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});

describe("POST /api/v1/auth/logout", () => {
    let token: string;

    beforeAll(async () => {
        await cleanDb();
        ({ token } = await registerUser("logout"));
    });

    test("logs out successfully", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/logout", undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test("rejects logout without token", async () => {
        const response = await apiRequest("POST", "/api/v1/auth/logout");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("blacklisted token rejected on subsequent request", async () => {
        const response = await apiRequest("GET", "/api/v1/habits", undefined, token);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});
