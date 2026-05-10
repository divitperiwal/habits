import z from "zod";

export const trackHabitSchema = z.object({
    note: z.string().max(255).optional(),
})

export const historyQuerySchema = z.object({
    days: z.coerce.number().min(1).max(30).default(7),
})