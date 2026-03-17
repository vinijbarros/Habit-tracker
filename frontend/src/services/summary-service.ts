import { http } from './http';
import type { HabitStatus } from '../types/habit';

export interface WeeklySummaryHabit {
  habitId: string;
  title: string;
  doneCount: number;
  missedCount: number;
  skippedCount: number;
  perDay: Array<{
    date: string;
    status: HabitStatus;
  }>;
}

export interface WeeklySummary {
  range: {
    start: string;
    end: string;
  };
  habits: WeeklySummaryHabit[];
}

interface SummaryResponse {
  success: true;
  data: WeeklySummary;
}

export async function getWeekSummary(start: string): Promise<WeeklySummary> {
  const response = await http.get<SummaryResponse>('/summary/week', {
    params: { start },
  });

  return response.data.data;
}

export async function getSummaryRange(start: string, end: string): Promise<WeeklySummary> {
  const response = await http.get<SummaryResponse>('/summary/week', {
    params: { start, end },
  });

  return response.data.data;
}
