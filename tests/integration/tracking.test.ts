import { beforeAll, describe, expect, test } from "bun:test";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { db } from "@/config/database.config";
import { habits, trackingLogs } from "@/database/schema";
import { apiRequest, cleanDb, createHabit, registerUser } from "./helpers";
import { eq } from "drizzle-orm";

dayjs.extend(utc);

const dateDaysAgo = (days: number) => dayjs.utc().subtract(days, "day").format("YYYY-MM-DD");

describe("POST /api/v1/habits/:id/track", () => {
    let token: string;
    let otherToken: string;
    let habitId: string;

    beforeAll(async () => {
        await cleanDb();
        ({ token } = await registerUser("track"));
        ({ token: otherToken } = await registerUser("track-other"));
        ({ habit: { id: habitId } } = await createHabit(token, { name: "Read" }));
    });

    test("tracks habit successfully", async () => {
        const response = await apiRequest("POST", `/api/v1/habits/${habitId}/track`, {}, token);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.habitId).toBe(habitId);
    });

    test("returns 409 when already tracked today", async () => {
        const response = await apiRequest("POST", `/api/v1/habits/${habitId}/track`, {}, token);

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
    });

    test("returns 404 for non-existent habit", async () => {
        const response = await apiRequest("POST", `/api/v1/habits/${crypto.randomUUID()}/track`, {}, token);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("cannot track another user's habit", async () => {
        const response = await apiRequest("POST", `/api/v1/habits/${habitId}/track`, {}, otherToken);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("stores note correctly", async () => {
        const { habit } = await createHabit(token, { name: "Write" });
        const response = await apiRequest("POST", `/api/v1/habits/${habit.id}/track`, {
            note: "Felt easy today",
        }, token);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.note).toBe("Felt easy today");
    });

    test("rejects unauthenticated request", async () => {
        const response = await apiRequest("POST", `/api/v1/habits/${habitId}/track`, {});

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe("GET /api/v1/habits/:id/history", () => {
    let token: string;
    let habitId: string;
    let userId: string;

    beforeAll(async () => {
        await cleanDb();
        const registered = await registerUser("history");
        token = registered.token;
        userId = registered.user.id;
        ({ habit: { id: habitId } } = await createHabit(token, { name: "Read" }));

        await db.insert(trackingLogs).values([
            { userId, habitId, date: dateDaysAgo(0), note: "Today" },
            { userId, habitId, date: dateDaysAgo(1), note: "Yesterday" },
            { userId, habitId, date: dateDaysAgo(2), note: "Two days ago" },
            { userId, habitId, date: dateDaysAgo(3), note: "Three days ago" },
        ]);

        await db.update(habits).set({ createdAt: new Date(dateDaysAgo(3)) }).where(eq(habits.id, habitId));
    });

    test("returns habits from the day of registering the habit", async () => {
        const response = await apiRequest("GET", `/api/v1/habits/${habitId}/history`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(4);
    });

    test("returns correct days with ?days param", async () => {
        const response = await apiRequest("GET", `/api/v1/habits/${habitId}/history?days=3`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(3);
    });

    test("tracked dates show completed true", async () => {
        const response = await apiRequest("GET", `/api/v1/habits/${habitId}/history?days=3`, undefined, token);
        const today = response.body.data.find((day: any) => day.date === dateDaysAgo(0));

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(today.completed).toBe(true);
    });

    test("rejects days > 30", async () => {
        const response = await apiRequest("GET", `/api/v1/habits/${habitId}/history?days=31`, undefined, token);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("returns 404 for non-existent habit", async () => {
        const response = await apiRequest("GET", `/api/v1/habits/${crypto.randomUUID()}/history`, undefined, token);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("rejects unauthenticated request", async () => {
        const response = await apiRequest("GET", `/api/v1/habits/${habitId}/history`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});
