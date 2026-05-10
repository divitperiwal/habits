import { pgTable, uuid, date, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { habits } from "./habits.schema";

export const trackingLogs = pgTable('tracking_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    uniqueIndex('tracking_logs_habit_date_unique').on(table.habitId, table.date),
    index('tracking_logs_user_id_idx').on(table.userId),
])
