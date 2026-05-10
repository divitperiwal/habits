export type CreateHabitInput = {
    name: string;
    description?: string;
    frequency?: 'daily' | 'weekly';
    tags?: string[];
    reminderTime?: string;
}

export type GetAllHabitsInput = {
    tag?: string;
    page: number;
    limit: number;
}

export type UpdateHabitInput = {
    name?: string;
    description?: string;
    frequency?: 'daily' | 'weekly';
    tags?: string[];
    reminderTime?: string;
}
