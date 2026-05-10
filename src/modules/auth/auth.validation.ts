import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6).max(72),
})

export const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.email(),
    password: z.string().min(6).max(72),
})