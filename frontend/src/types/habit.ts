export type FrequencyType = 'DAILY' | 'WEEKLY' | 'CUSTOM';
export type CustomFrequencyPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type HabitStatus = 'DONE' | 'MISSED' | 'SKIPPED' | 'PENDING';
export type HabitPeriodKind = 'DAY' | 'WEEK' | 'MONTH';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  frequencyType: FrequencyType;
  weeklyTarget: number | null;
  customFrequencyCount: number | null;
  customFrequencyPeriod: CustomFrequencyPeriod | null;
  points: number;
  active: boolean;
  createdAt: string;
}

export interface DayHabit {
  habitId: string;
  title: string;
  frequencyType: FrequencyType;
  weeklyTarget: number | null;
  customFrequencyCount: number | null;
  customFrequencyPeriod: CustomFrequencyPeriod | null;
  periodKind: HabitPeriodKind;
  targetInPeriod: number;
  completedInPeriod: number;
  remainingInPeriod: number;
  status: HabitStatus;
}
