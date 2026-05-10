import type { Request, Response } from 'express';
import { createHabitSchema, getHabitsQuerySchema, habitIdSchema, updateHabitSchema } from './habits.validation';
import { asyncHandler } from '@/utils/response/async';
import { sendSuccess } from '@/utils/response/response';
import { HabitsService } from './habits.service';

export const HabitsController = {
    createHabit: asyncHandler(async (req: Request, res: Response) => {
        const data = createHabitSchema.parse(req.body);
        const user = req.user;

        const newHabit = await HabitsService.createHabit(user!.id, data);
        sendSuccess(res, 201, 'Habit created successfully', newHabit);
    }),

    getAllHabits: asyncHandler(async (req: Request, res: Response) => {
        const user = req.user;
        const pagination = getHabitsQuerySchema.parse(req.query);

        const result = await HabitsService.getAllHabits(user!.id, pagination);

        sendSuccess(res, 200, 'Habits retrieved successfully', result);

    }),

    getHabit: asyncHandler(async (req: Request, res: Response) => {
        const user = req.user;
        const { id: habitId } = habitIdSchema.parse(req.params);

        const habit = await HabitsService.getHabitById(user!.id, habitId);
        sendSuccess(res, 200, 'Habit retrieved successfully', habit);
    }),

    updateHabit: asyncHandler(async (req: Request, res: Response) => {
        const user = req.user;
        const { id: habitId } = habitIdSchema.parse(req.params);
        const data = updateHabitSchema.parse(req.body);

        const updatedHabit = await HabitsService.updateHabit(user!.id, habitId, data);
        sendSuccess(res, 200, 'Habit updated successfully', updatedHabit);
    }),

    deleteHabit: asyncHandler(async (req: Request, res: Response) => {
        const user = req.user;
        const { id: habitId } = habitIdSchema.parse(req.params);

        await HabitsService.deleteHabit(user!.id, habitId);

        sendSuccess(res, 200, 'Habit deleted successfully');
    })

}