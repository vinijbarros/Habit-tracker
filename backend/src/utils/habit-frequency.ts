import type { CustomFrequencyPeriod, FrequencyType, HabitLogStatus } from '@prisma/client';
import {
  addDaysLocal,
  endOfMonthLocal,
  endOfWeekLocal,
  formatLocalDateOnly,
  getTodayLocalDateOnly,
  startOfMonthLocal,
  startOfWeekLocal,
} from './date';

export type DayStatus = HabitLogStatus | 'PENDING';
export type HabitPeriodKind = 'DAY' | 'WEEK' | 'MONTH';

export interface HabitFrequencySnapshot {
  frequencyType: FrequencyType;
  weeklyTarget: number | null;
  customFrequencyCount: number | null;
  customFrequencyPeriod: CustomFrequencyPeriod | null;
}

export function getTargetPerPeriod(habit: HabitFrequencySnapshot): number {
  if (habit.frequencyType === 'DAILY') {
    return 1;
  }

  if (habit.frequencyType === 'WEEKLY') {
    return habit.weeklyTarget ?? 1;
  }

  return habit.customFrequencyCount ?? 1;
}

export function getPeriodKind(habit: HabitFrequencySnapshot): HabitPeriodKind {
  if (habit.frequencyType === 'DAILY') {
    return 'DAY';
  }

  if (habit.frequencyType === 'WEEKLY') {
    return 'WEEK';
  }

  if (habit.customFrequencyPeriod === 'MONTHLY') {
    return 'MONTH';
  }

  if (habit.customFrequencyPeriod === 'DAILY') {
    return 'DAY';
  }

  return 'WEEK';
}

export function getPeriodBounds(
  date: Date,
  kind: HabitPeriodKind,
): { start: Date; end: Date } {
  if (kind === 'DAY') {
    return { start: date, end: date };
  }

  if (kind === 'WEEK') {
    return {
      start: startOfWeekLocal(date),
      end: endOfWeekLocal(date),
    };
  }

  return {
    start: startOfMonthLocal(date),
    end: endOfMonthLocal(date),
  };
}

export function getDefaultDayStatus(habit: HabitFrequencySnapshot, date: Date): DayStatus {
  if (habit.frequencyType === 'DAILY' && date.getTime() < getTodayLocalDateOnly().getTime()) {
    return 'MISSED';
  }

  return 'PENDING';
}

export function calculateHabitTargetCount(
  habit: HabitFrequencySnapshot,
  startDate: Date,
  endDate: Date,
): number {
  const kind = getPeriodKind(habit);
  const targetPerPeriod = getTargetPerPeriod(habit);
  const visited = new Set<string>();
  let total = 0;

  for (
    let currentDate = startDate;
    currentDate.getTime() <= endDate.getTime();
    currentDate = addDaysLocal(currentDate, 1)
  ) {
    const bounds = getPeriodBounds(currentDate, kind);
    const key = `${kind}:${formatLocalDateOnly(bounds.start)}`;

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);
    total += targetPerPeriod;
  }

  return total;
}

export function calculateCompletionRate(doneCount: number, targetCount: number): number {
  if (targetCount <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((doneCount / targetCount) * 100));
}

export function getCurrentPeriodProgress(
  habit: HabitFrequencySnapshot,
  referenceDate: Date,
  doneCountInPeriod: number,
): {
  periodKind: HabitPeriodKind;
  targetCount: number;
  completedCount: number;
  remainingCount: number;
} {
  const periodKind = getPeriodKind(habit);
  const targetCount = getTargetPerPeriod(habit);
  const completedCount = doneCountInPeriod;
  const remainingCount = Math.max(targetCount - completedCount, 0);

  return {
    periodKind,
    targetCount,
    completedCount,
    remainingCount,
  };
}
