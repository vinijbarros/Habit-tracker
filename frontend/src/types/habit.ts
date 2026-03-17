export type FrequencyType = 'DAILY' | 'WEEKLY' | 'CUSTOM';
export type HabitStatus = 'DONE' | 'MISSED' | 'SKIPPED' | 'PENDING';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  frequencyType: FrequencyType;
  weeklyTarget: number | null;
  active: boolean;
  createdAt: string;
}

export interface DayHabit {
  habitId: string;
  title: string;
  status: HabitStatus;
}
