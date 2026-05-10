import { index, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { habitFrequencyEnum } from "./enums.schema";

export const habits = pgTable('habits', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    frequency: habitFrequencyEnum('frequency').notNull().default('daily'),
    tags: text('tags').array().notNull().default([]),
    reminderTime: time('reminder_time'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index('habits_user_id_idx').on(table.userId),
    index('habits_user_deleted_idx').on(table.userId, table.deletedAt)
]);