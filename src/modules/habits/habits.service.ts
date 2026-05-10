import { ApiError } from "@/utils/response/error";
import type { CreateHabitInput, UpdateHabitInput } from "./habits.type";
import { HabitsRepository } from "./habits.repository";

export const HabitsService = {
    createHabit: async (userId: string, data: CreateHabitInput) => {
        return await HabitsRepository.createHabit(userId, data);
    },

    getAllHabits: async (userId: string, { tag, page, limit }: { tag?: string; page: number; limit: number }) => {
        const { data, total } = await HabitsRepository.getAllHabits(userId, { tag, page, limit });

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    },

    getHabitById: async (userId: string, habitId: string) => {
        const habit = await HabitsRepository.getHabitById(userId, habitId);
        if (!habit) throw new ApiError('Habit not found', 404);
        return habit;
    },

    updateHabit: async (userId: string, habitId: string, data: UpdateHabitInput) => {
        if (Object.keys(data).length === 0) throw new ApiError('No data provided for update', 400);

        const habit = await HabitsRepository.updateHabit(userId, habitId, data);
        if (!habit) throw new ApiError('Habit not found', 404);

        return habit;
    },

    deleteHabit: async (userId: string, habitId: string) => {
        const habit = await HabitsRepository.deleteHabit(userId, habitId);
        if (!habit) throw new ApiError('Habit not found', 404);
        return;
    }

}