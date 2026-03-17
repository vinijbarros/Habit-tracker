import { http } from './http';
import type { DayHabit, HabitStatus } from '../types/habit';

interface DayResponse {
  success: true;
  data: DayHabit[];
}

interface CheckResponse {
  success: true;
  data: {
    habitLog: {
      id: string;
      habitId: string;
      date: string;
      status: Exclude<HabitStatus, 'PENDING'>;
      createdAt: string;
    };
  };
}

export async function getDay(date: string): Promise<DayHabit[]> {
  const response = await http.get<DayResponse>('/day', {
    params: { date },
  });

  return response.data.data;
}

export async function checkHabit(
  habitId: string,
  date: string,
  status: 'DONE' | 'MISSED' | 'SKIPPED',
): Promise<void> {
  await http.post<CheckResponse>(`/habits/${habitId}/check`, { date, status });
}
