import { cron } from "bun";
import { runHabitCleanup } from "./cleanup.job";

export const startJobs = () => {
    cron("0 0 * * *", async () => {
        runHabitCleanup().catch((err) => console.error("Cleanup job failed"))
    })
}