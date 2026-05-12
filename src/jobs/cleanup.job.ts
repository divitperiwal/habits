import dayjs from "dayjs"
import { HabitsRepository } from "@/modules/habits/habits.repository"

export const runHabitCleanup = async () => {
    const cutoffDate = dayjs().subtract(30, "day").toDate()
    await HabitsRepository.cleanUp(cutoffDate)
    console.log(`Cleaned up habits deleted before ${cutoffDate.toISOString()}`)
}