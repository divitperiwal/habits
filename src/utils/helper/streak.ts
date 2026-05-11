import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(utc);
dayjs.extend(isoWeek);



export const calculateCurrentStreak = (logs: string[], frequency: "daily" | "weekly") => {
    const periods = toPeriodKeys(logs, frequency);
    if (periods.length === 0) return 0;

    const today = toPeriodKey(dayjs.utc(), frequency);
    const yesterday = toPeriodKey(dayjs.utc().subtract(1, toUnit(frequency)), frequency);

    const mostRecent = periods[0];
    if (mostRecent !== today && mostRecent !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < periods.length; i++) {
        const newer = periods[i - 1];
        const older = periods[i];
        if (!newer || !older) break;
        if (!isConsecutive(newer, older, frequency)) break;
        streak++;
    }

    return streak;
}


export const calculateLongestStreak = (logs: string[], frequency: "daily" | "weekly") => {
    const periods = toPeriodKeys(logs, frequency);
    if (periods.length === 0) return 0;

    let longest = 1;
    let currentRun = 1;

    for (let i = 1; i < periods.length; i++) {
        const newer = periods[i - 1];
        const older = periods[i];
        if (!newer || !older) break;
        if (isConsecutive(newer, older, frequency)) {
            currentRun++;
            if (currentRun > longest) longest = currentRun;
        } else {
            currentRun = 1;
        }
    }

    return longest;
};


export const calculateCompletionRate = (logs: string[], periodCount: number, frequency: "daily" | "weekly") => {
    if (logs.length === 0 || periodCount <= 0) return 0;

    const unit = toUnit(frequency);
    const since = dayjs.utc().subtract(periodCount - 1, unit).startOf(unit);

    const completed = new Set(
        logs.map(log => toPeriodKey(log, frequency)).filter(key => !dayjs.utc(key).isBefore(since, unit)),
    ).size;

    return Math.round((completed / periodCount) * 1000) / 10;
};



//Helper Functions
const toPeriodKey = (date: string | dayjs.Dayjs, frequency: "daily" | "weekly") => {
    const d = dayjs.utc(date);
    return frequency === 'daily' ? d.format('YYYY-MM-DD') : d.startOf('isoWeek').format('YYYY-MM-DD');
}

const toPeriodKeys = (logs: string[], frequency: "daily" | "weekly") => {
    const keys = logs.map(log => toPeriodKey(log, frequency));
    return [...new Set(keys)].sort().reverse();
}

const toUnit = (frequency: "daily" | "weekly") => frequency === 'daily' ? 'day' : 'week';

const isConsecutive = (newerKey: string, olderKey: string, frequency: "daily" | "weekly") => {
    const unit = toUnit(frequency);
    return dayjs.utc(newerKey).diff(dayjs.utc(olderKey), unit) === 1;
}