import { z } from 'zod';

export const createHabitSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    frequency: z.enum(['daily', 'weekly']).default('daily'),
    tags: z.array(z.string().min(1)).default([]),
    reminderTime: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/).optional()
})

export const getHabitsQuerySchema = z.object({
    tag: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(20).default(10),
});

export const habitIdSchema = z.object({
    id: z.uuid("Invalid habit ID format")
})

export const updateHabitSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    frequency: z.enum(['daily', 'weekly']).optional(),
    tags: z.array(z.string().min(1)).optional(),
    reminderTime: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/).optional()
})