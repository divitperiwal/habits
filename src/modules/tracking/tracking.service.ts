import { ApiError } from "@/utils/response/error";
import { HabitsRepository } from "../habits/habits.repository";
import type { TrackHabitInput } from "./tracking.types";
import { TrackingRepository } from "./tracking.repository";
import { getDateRange, toDateOnly } from "@/utils/helper/date";

export const TrackingService = {
    trackHabit: async (userId: string, habitId: string, data: TrackHabitInput) => {
        const habit = await HabitsRepository.getHabitById(userId, habitId);
        if (!habit) throw new ApiError("Habit not found", 404);

        const isAlreadyTracked = await TrackingRepository.isTrackedToday(userId, habitId);
        if (isAlreadyTracked) throw new ApiError("Habit already tracked for today", 409);

        return await TrackingRepository.trackHabit(userId, habitId, data);
    },

    getHistory: async (userId: string, habitId: string, days: number) => {
        const habit = await HabitsRepository.getHabitById(userId, habitId);
        if (!habit) throw new ApiError("Habit not found", 404);

        const logs = await TrackingRepository.getHistory(userId, habitId, days);
        const logMap = new Map(logs.map((l) => [l.date, l.note]));

        const habitCreatedAt = toDateOnly(habit.createdAt);

        return getDateRange(days)
            .filter(date => date >= habitCreatedAt)
            .map((date) => ({
                date,
                completed: logMap.has(date),
                ...(logMap.get(date) ? { note: logMap.get(date)! } : {}),
            }));
    },
}
