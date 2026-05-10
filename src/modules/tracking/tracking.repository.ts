import { db } from "@/config/database.config";
import { trackingLogs } from "@/database/schema";
import { getSinceDate, toDateOnly, today } from "@/utils/helper/date"
import { and, eq, gte } from "drizzle-orm";
import type { TrackHabitInput } from "./tracking.types";

export const TrackingRepository = {

    trackHabit: async (userId: string, habitId: string, data: TrackHabitInput) => {
        const [log] = await db
        .insert(trackingLogs)
        .values({
            habitId,
            userId,
            date: today(),
            note: data.note
        })
        .returning({
            id: trackingLogs.id,
            habitId: trackingLogs.habitId,
            date: trackingLogs.date,
            note: trackingLogs.note,
            createdAt: trackingLogs.createdAt
        })

        return log;
    },

    getHistory: async (userId: string, habitId: string, days: number) => {
        const since = getSinceDate(days)

        return await db
        .select({
            date: trackingLogs.date,
            note: trackingLogs.note,
        })
        .from(trackingLogs)
        .where(and(eq(trackingLogs.userId, userId), eq(trackingLogs.habitId, habitId), gte(trackingLogs.date, since)))
    },

    isTrackedToday: async (userId: string, habitId: string) => {
        const [log] = await db
        .select({ id: trackingLogs.id })
        .from(trackingLogs)
        .where(and(eq(trackingLogs.userId, userId), eq(trackingLogs.habitId, habitId), eq(trackingLogs.date, today())))
        .limit(1);

        return !!log;
    }

}