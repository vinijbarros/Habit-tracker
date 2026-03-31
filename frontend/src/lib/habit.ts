import type { FrequencyType, HabitStatus } from '../types/habit';
import type { Language } from '../i18n';

export function getFrequencyLabel(
  frequencyType: FrequencyType,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  return t(`habits.frequency.${frequencyType}`);
}

export function getCompletionRate(doneCount: number, totalCount: number): number {
  if (totalCount === 0) {
    return 0;
  }

  return Math.round((doneCount / totalCount) * 100);
}

export function getCurrentStreak(statuses: HabitStatus[]): number {
  let streak = 0;

  for (let index = statuses.length - 1; index >= 0; index -= 1) {
    if (statuses[index] === 'DONE') {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

export function formatDisplayDate(value: string, language: Language): string {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const localeMap: Record<Language, string> = {
    'pt-BR': 'pt-BR',
    en: 'en-US',
    es: 'es-ES',
  };

  return new Intl.DateTimeFormat(localeMap[language], {
    month: 'short',
    day: '2-digit',
  }).format(date);
}
