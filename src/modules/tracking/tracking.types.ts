export type TrackHabitInput = {
    note?: string;
}

export type HistoryQuery = {
    days: number;
}

export type HistoryEntry = {
    date: string;
    completed: boolean;
    note?: string;
}