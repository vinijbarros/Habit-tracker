import { http } from './http';
import type { FrequencyType, Habit } from '../types/habit';

interface HabitsResponse {
  success: true;
  data: {
    habits: Habit[];
  };
}

interface HabitResponse {
  success: true;
  data: {
    habit: Habit;
  };
}

export interface HabitPayload {
  title: string;
  frequencyType: FrequencyType;
  weeklyTarget?: number | null;
}

export interface HabitUpdatePayload {
  title?: string;
  frequencyType?: FrequencyType;
  weeklyTarget?: number | null;
  active?: boolean;
}

export async function getHabits(): Promise<Habit[]> {
  const response = await http.get<HabitsResponse>('/habits');
  return response.data.data.habits;
}

export async function createHabit(payload: HabitPayload): Promise<Habit> {
  const response = await http.post<HabitResponse>('/habits', payload);
  return response.data.data.habit;
}

export async function updateHabit(id: string, payload: HabitUpdatePayload): Promise<Habit> {
  const response = await http.put<HabitResponse>(`/habits/${id}`, payload);
  return response.data.data.habit;
}

export async function deactivateHabit(id: string): Promise<Habit> {
  const response = await http.delete<HabitResponse>(`/habits/${id}`);
  return response.data.data.habit;
}
