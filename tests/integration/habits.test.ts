import { beforeAll, describe, expect, test } from "bun:test";
import { apiRequest, cleanDb, createHabit, registerUser } from "../helpers";

describe("POST /api/v1/habits", () => {
    let token: string;

    beforeAll(async () => {
        await cleanDb();
        ({ token } = await registerUser("habit-create"));
    });

    test("creates habit successfully", async () => {
        const response = await apiRequest("POST", "/api/v1/habits", { name: "Read" }, token);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(typeof response.body.data.id).toBe("string");
    });

    test("creates habit with all optional fields", async () => {
        const response = await apiRequest("POST", "/api/v1/habits", {
            name: "Workout",
            description: "Strength training",
            frequency: "weekly",
            tags: ["health", "gym"],
            reminderTime: "09:30",
        }, token);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    });

    test("defaults frequency to daily", async () => {
        const { habit } = await createHabit(token, { name: "Journal" });
        const response = await apiRequest("GET", `/api/v1/habits/${habit.id}`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.frequency).toBe("daily");
    });

    test("rejects missing name", async () => {
        const response = await apiRequest("POST", "/api/v1/habits", {}, token);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("rejects invalid frequency", async () => {
        const response = await apiRequest("POST", "/api/v1/habits", {
            name: "Read",
            frequency: "monthly",
        }, token);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("rejects invalid reminderTime format", async () => {
        const response = await apiRequest("POST", "/api/v1/habits", {
            name: "Read",
            reminderTime: "25:99",
        }, token);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("rejects unauthenticated request", async () => {
        const response = await apiRequest("POST", "/api/v1/habits", { name: "Read" });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe("GET /api/v1/habits", () => {
    let token: string;

    beforeAll(async () => {
        await cleanDb();
        ({ token } = await registerUser("habit-list"));
        await createHabit(token, { name: "Read", tags: ["mind"] });
        await createHabit(token, { name: "Run", tags: ["health"] });
        await createHabit(token, { name: "Sleep", tags: ["health"] });
    });

    test("returns paginated habits", async () => {
        const response = await apiRequest("GET", "/api/v1/habits?page=1&limit=2", undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.data.length).toBe(2);
        expect(response.body.data.pagination.total).toBe(3);
    });

    test("returns empty array when no habits", async () => {
        await cleanDb();
        ({ token } = await registerUser("habit-empty"));
        const response = await apiRequest("GET", "/api/v1/habits", undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.data).toEqual([]);
    });

    test("filters by tag correctly", async () => {
        await createHabit(token, { name: "Read", tags: ["mind"] });
        await createHabit(token, { name: "Run", tags: ["health"] });
        const response = await apiRequest("GET", "/api/v1/habits?tag=health", undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.data.every((habit: any) => habit.tags.includes("health"))).toBe(true);
    });

    test("pagination works correctly", async () => {
        const response = await apiRequest("GET", "/api/v1/habits?page=2&limit=1", undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.data.length).toBe(1);
        expect(response.body.data.pagination.page).toBe(2);
    });

    test("rejects unauthenticated request", async () => {
        const response = await apiRequest("GET", "/api/v1/habits");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe("GET /api/v1/habits/:id", () => {
    let token: string;
    let otherToken: string;
    let habitId: string;

    beforeAll(async () => {
        await cleanDb();
        ({ token } = await registerUser("habit-get"));
        ({ token: otherToken } = await registerUser("habit-get-other"));
        ({ habit: { id: habitId } } = await createHabit(token, { name: "Read" }));
    });

    test("returns habit by id", async () => {
        const response = await apiRequest("GET", `/api/v1/habits/${habitId}`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(habitId);
    });

    test("returns 404 for non-existent habit", async () => {
        const response = await apiRequest("GET", `/api/v1/habits/${crypto.randomUUID()}`, undefined, token);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("returns 404 for another user's habit", async () => {
        const response = await apiRequest("GET", `/api/v1/habits/${habitId}`, undefined, otherToken);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("rejects invalid uuid", async () => {
        const response = await apiRequest("GET", "/api/v1/habits/not-a-uuid", undefined, token);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("rejects unauthenticated request", async () => {
        const response = await apiRequest("GET", `/api/v1/habits/${habitId}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe("PUT /api/v1/habits/:id", () => {
    let token: string;
    let otherToken: string;
    let habitId: string;

    beforeAll(async () => {
        await cleanDb();
        ({ token } = await registerUser("habit-update"));
        ({ token: otherToken } = await registerUser("habit-update-other"));
        ({ habit: { id: habitId } } = await createHabit(token, { name: "Read" }));
    });

    test("updates habit successfully", async () => {
        const response = await apiRequest("PUT", `/api/v1/habits/${habitId}`, {
            name: "Read Books",
            frequency: "weekly",
        }, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe("Read Books");
    });

    test("partial update works", async () => {
        const response = await apiRequest("PUT", `/api/v1/habits/${habitId}`, {
            description: "Ten pages",
        }, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.description).toBe("Ten pages");
    });

    test("rejects empty body", async () => {
        const response = await apiRequest("PUT", `/api/v1/habits/${habitId}`, {}, token);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("returns 404 for non-existent habit", async () => {
        const response = await apiRequest("PUT", `/api/v1/habits/${crypto.randomUUID()}`, {
            name: "Missing",
        }, token);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("cannot update another user's habit", async () => {
        const response = await apiRequest("PUT", `/api/v1/habits/${habitId}`, {
            name: "Nope",
        }, otherToken);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("rejects unauthenticated request", async () => {
        const response = await apiRequest("PUT", `/api/v1/habits/${habitId}`, { name: "Nope" });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe("DELETE /api/v1/habits/:id", () => {
    let token: string;
    let otherToken: string;
    let habitId: string;

    beforeAll(async () => {
        await cleanDb();
        ({ token } = await registerUser("habit-delete"));
        ({ token: otherToken } = await registerUser("habit-delete-other"));
        ({ habit: { id: habitId } } = await createHabit(token, { name: "Read" }));
    });

    test("soft deletes habit", async () => {
        const response = await apiRequest("DELETE", `/api/v1/habits/${habitId}`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test("deleted habit not returned in GET /habits", async () => {
        const response = await apiRequest("GET", "/api/v1/habits", undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.data.some((habit: any) => habit.id === habitId)).toBe(false);
    });

    test("returns 404 for already deleted habit", async () => {
        const response = await apiRequest("DELETE", `/api/v1/habits/${habitId}`, undefined, token);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("cannot delete another user's habit", async () => {
        const { habit } = await createHabit(token, { name: "Private" });
        const response = await apiRequest("DELETE", `/api/v1/habits/${habit.id}`, undefined, otherToken);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("rejects unauthenticated request", async () => {
        const response = await apiRequest("DELETE", `/api/v1/habits/${habitId}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});
