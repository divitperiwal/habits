import { db } from "@/config/database.config";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export const AuthRepository = {
    findUserByEmail: async (email: string) => {
        const user = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email)).limit(1);
        return user ?? null;
    },

    findUserByEmailWithPassword: async (email: string) => {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user ?? null;
    },

    createUser: async (name: string, email: string, passwordHash: string) => {
        const [user] = await db.insert(users).values({
            name,
            email,
            password: passwordHash,
        }).returning({ id: users.id, email: users.email, createdAt: users.createdAt });

        return user ?? null;
    }
}