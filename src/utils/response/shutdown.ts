import { pool } from "@/config/database.config";
import redis from "@/config/redis.config";
import type { Server } from "node:http";

export const gracefulShutdown = (server: Server, signal: string, error?: Error | unknown, timeout = 10000) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
        console.log('HTTP server closed')

        try {
            await pool.end();
            console.log("PostgreSQL Closed.")

            await redis.quit()
            console.log("Redis connection closed.")

            console.log("Graceful shutdown completed.");

            process.exit(0);
        } catch (error) {
            console.error("Shutdown error:", error);

            process.exit(1);
        }
    })

    setTimeout(() => {
        console.error("Forced shutdown.");

        process.exit(1);
    }, timeout).unref();

}