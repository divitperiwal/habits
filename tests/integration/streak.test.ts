import { beforeEach, describe, expect, test } from "bun:test";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isoWeek from "dayjs/plugin/isoWeek";
import { apiRequest, cleanDb, createHabit, registerUser } from "../helpers";
import { trackingLogs } from "@/database/schema";
import { db } from "@/config/database.config";

dayjs.extend(utc);
dayjs.extend(isoWeek);

const daysAgo = (days: number) => dayjs.utc().subtract(days, "day").format("YYYY-MM-DD");
const weeksAgo = (weeks: number) => dayjs.utc().subtract(weeks, "week").format("YYYY-MM-DD");
const weekDay = (weeksAgo: number, dayOffset: number) => {
    return dayjs.utc().subtract(weeksAgo, "week").startOf("isoWeek").add(dayOffset, "day").format("YYYY-MM-DD");
};
const insertLogs = async (userId: string, habitId: string, dates: string[]) => {
    await db.insert(trackingLogs).values(
        dates.map((date) => ({
            userId,
            habitId,
            date,
        })),
    );
};

describe("GET /api/v1/habits/:id/stats", () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
        await cleanDb();
        const registered = await registerUser("streak");
        token = registered.token;
        userId = registered.user.id;
    });

    test("calculates current and longest daily streak from tracking logs", async () => {
        const { habit } = await createHabit(token, { name: "Read" });
        await insertLogs(userId, habit.id, [daysAgo(0), daysAgo(1), daysAgo(2)]);

        const response = await apiRequest("GET", `/api/v1/habits/${habit.id}/stats`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.currentStreak).toBe(3);
        expect(response.body.data.longestStreak).toBe(3);
        expect(response.body.data.completionRate).toBe(10);
    });

    test("keeps current daily streak alive when yesterday is tracked", async () => {
        const { habit } = await createHabit(token, { name: "Journal" });
        await insertLogs(userId, habit.id, [daysAgo(1), daysAgo(2)]);

        const response = await apiRequest("GET", `/api/v1/habits/${habit.id}/stats`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.currentStreak).toBe(2);
        expect(response.body.data.longestStreak).toBe(2);
    });

    test("separates current streak from longest daily streak after a missed day", async () => {
        const { habit } = await createHabit(token, { name: "Workout" });
        await insertLogs(userId, habit.id, [daysAgo(0), daysAgo(2), daysAgo(3), daysAgo(4)]);

        const response = await apiRequest("GET", `/api/v1/habits/${habit.id}/stats`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.currentStreak).toBe(1);
        expect(response.body.data.longestStreak).toBe(3);
    });

    test("returns 0 current streak when the newest tracking log is too old", async () => {
        const { habit } = await createHabit(token, { name: "Meditate" });
        await insertLogs(userId, habit.id, [daysAgo(2), daysAgo(3)]);

        const response = await apiRequest("GET", `/api/v1/habits/${habit.id}/stats`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.currentStreak).toBe(0);
        expect(response.body.data.longestStreak).toBe(2);
    });

    test("calculates weekly streaks from database logs", async () => {
        const { habit } = await createHabit(token, { name: "Review", frequency: "weekly" });
        await insertLogs(userId, habit.id, [weeksAgo(0), weeksAgo(1), weeksAgo(2)]);

        const response = await apiRequest("GET", `/api/v1/habits/${habit.id}/stats`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.currentStreak).toBe(3);
        expect(response.body.data.longestStreak).toBe(3);
        expect(response.body.data.completionRate).toBe(10);
    });

    test("counts multiple logs in the same week as one weekly period", async () => {
        const { habit } = await createHabit(token, { name: "Plan", frequency: "weekly" });
        await insertLogs(userId, habit.id, [weekDay(1, 0), weekDay(1, 1), weekDay(2, 0)]);

        const response = await apiRequest("GET", `/api/v1/habits/${habit.id}/stats`, undefined, token);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.currentStreak).toBe(2);
        expect(response.body.data.longestStreak).toBe(2);
        expect(response.body.data.completionRate).toBe(6.7);
    });

    test("returns 404 for another user's habit", async () => {
        const { token: otherToken } = await registerUser("streak-other");
        const { habit } = await createHabit(token, { name: "Private" });

        const response = await apiRequest("GET", `/api/v1/habits/${habit.id}/stats`, undefined, otherToken);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("rejects unauthenticated request", async () => {
        const { habit } = await createHabit(token, { name: "No Auth" });

        const response = await apiRequest("GET", `/api/v1/habits/${habit.id}/stats`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});
