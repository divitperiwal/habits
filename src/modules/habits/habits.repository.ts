import { db } from "@/config/database.config";
import type { CreateHabitInput, GetAllHabitsInput, UpdateHabitInput } from "./habits.type";
import { habits, trackingLogs } from "@/database/schema";
import { and, arrayContains, eq, isNull, count as countFn, inArray } from "drizzle-orm";

export const HabitsRepository = {
    createHabit: async (userId: string, data: CreateHabitInput) => {
        const [habit] = await db.insert(habits).values({
            userId,
            name: data.name,
            description: data.description,
            frequency: data.frequency ?? 'daily',
            tags: data.tags ?? [],
            reminderTime: data.reminderTime
        }).returning({
            id: habits.id,
            userId: habits.userId,
            name: habits.name,
            reminderTime: habits.reminderTime,
            createdAt: habits.createdAt,
        })

        return habit;
    },

    getAllHabits: async (userId: string, { tag, page, limit }: GetAllHabitsInput) => {
        const offset = (page - 1) * limit;
        const whereClause = tag
            ? and(eq(habits.userId, userId), isNull(habits.deletedAt), arrayContains(habits.tags, [tag]))
            : and(eq(habits.userId, userId), isNull(habits.deletedAt));

        const [data, countResult] = await Promise.all([
            db.select({
                id: habits.id,
                name: habits.name,
                description: habits.description,
                frequency: habits.frequency,
                tags: habits.tags,
                reminderTime: habits.reminderTime,
                createdAt: habits.createdAt,
                updatedAt: habits.updatedAt,
            })
                .from(habits)
                .where(whereClause)
                .limit(limit)
                .offset(offset),

            db.select({ count: countFn() })
                .from(habits)
                .where(whereClause)
        ])

        return { data, total: Number(countResult[0]?.count ?? 0) }
    },

    getHabitById: async (userId: string, habitId: string) => {
        const [habit] = await db.select({
            id: habits.id,
            name: habits.name,
            description: habits.description,
            frequency: habits.frequency,
            tags: habits.tags,
            reminderTime: habits.reminderTime,
            createdAt: habits.createdAt,
            updatedAt: habits.updatedAt,
        }).from(habits).where(and(eq(habits.userId, userId), eq(habits.id, habitId), isNull(habits.deletedAt))).limit(1);

        return habit || null;
    },

    updateHabit: async (userId: string, habitId: string, data: UpdateHabitInput) => {
        const [updatedHabit] = await db.update(habits).set({
            ...data,
            updatedAt: new Date()
        }).where(and(eq(habits.userId, userId), eq(habits.id, habitId), isNull(habits.deletedAt))).returning({
            id: habits.id,
            name: habits.name,
            description: habits.description,
            frequency: habits.frequency,
            tags: habits.tags,
            reminderTime: habits.reminderTime,
            createdAt: habits.createdAt,
            updatedAt: habits.updatedAt,
        });

        return updatedHabit ?? null;
    },

    deleteHabit: async (userId: string, habitId: string) => {
        const [habit] = await db.update(habits).set({
            deletedAt: new Date()
        }).where(and(eq(habits.userId, userId), eq(habits.id, habitId), isNull(habits.deletedAt))).returning({
            id: habits.id,
        });

        return habit ?? null;
    },

    getTrackingLogs: async (userId: string, habitId: string) => {
        return await db
            .select({
                date: trackingLogs.date,
            })
            .from(trackingLogs)
            .where(and(eq(trackingLogs.userId, userId), eq(trackingLogs.habitId, habitId)));
    }
}
