import redis from "@/config/redis.config"

export const AuthCache = {
    get: async (key: string | undefined) => {
        if (!key) return null;
        return await redis.get(`blacklist:${key}`);
    },

    set: async (key: string, value: string, ttl?: number) => {
        if (!ttl) return;
        await redis.set(`blacklist:${key}`, value, 'EX', ttl);
    }
}