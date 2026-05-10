import { asyncHandler } from "@/utils/response/async";
import { habitIdSchema } from "../habits/habits.validation";
import { historyQuerySchema, trackHabitSchema } from "./tracking.validation";
import { sendSuccess } from "@/utils/response/response";
import { TrackingService } from "./tracking.service";

export const TrackingController = {
    trackHabit: asyncHandler(async (req, res) => {
        const user = req.user;
        const { id: habitId } = habitIdSchema.parse(req.params);
        const data = trackHabitSchema.parse(req.body);

        const log = await TrackingService.trackHabit(user!.id, habitId, data);

        sendSuccess(res, 200, "Habit tracked successfully", log);
    }),

    getHistory: asyncHandler(async (req, res) => {
        const user = req.user;
        const { id: habitId } = habitIdSchema.parse(req.params);
        const { days } = historyQuerySchema.parse(req.query);

        const history = await TrackingService.getHistory(user!.id, habitId, days);

        sendSuccess(res, 200, "History retrieved successfully", history);
    })
}