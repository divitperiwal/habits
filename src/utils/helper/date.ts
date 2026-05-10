import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const toDateOnly = (date: Date | string): string => {
    return dayjs(date).utc().format("YYYY-MM-DD");
};

export const today = (): string => {
    return dayjs().utc().format("YYYY-MM-DD");
};

export const yesterday = (): string => {
    return dayjs().utc().subtract(1, "day").format("YYYY-MM-DD");
};

export const getSinceDate = (days: number): string => {
    return dayjs().utc().subtract(days - 1, "day").format("YYYY-MM-DD");
};

export const getDateRange = (days: number): string[] => {
    return Array.from({ length: days }, (_, i) =>
        dayjs().utc().subtract(i, "day").format("YYYY-MM-DD")
    );
};

export const diffInDays = (a: string, b: string): number => {
    return dayjs(a).utc().diff(dayjs(b).utc(), "day");
};

export const isSameWeek = (a: string, b: string): boolean => {
    return dayjs(a).utc().isSame(dayjs(b).utc(), "week");
};
