import { CalendarDays } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { HabitCard } from '../components/habits/habit-card';
import { ProgressCard } from '../components/habits/progress-card';
import { EmptyState } from '../components/ui/empty-state';
import { StatusBadge } from '../components/ui/status-badge';
import { useLanguage } from '../contexts/language-context';
import { getTodayDateInput } from '../lib/date';
import { checkHabit, getDay } from '../services/day-service';
import { getErrorMessage } from '../services/error-message';
import type { DayHabit, HabitStatus } from '../types/habit';

const statusActions: Array<Exclude<HabitStatus, 'PENDING'>> = ['DONE', 'SKIPPED', 'MISSED'];

export function TodayPage() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(getTodayDateInput);
  const [dayHabits, setDayHabits] = useState<DayHabit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    void loadDay(selectedDate);
  }, [selectedDate]);

  const doneCount = useMemo(
    () => dayHabits.filter((habit) => habit.status === 'DONE').length,
    [dayHabits],
  );

  const loadDay = async (date: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getDay(date);
      setDayHabits(response);
    } catch (loadError) {
      setError(getErrorMessage(loadError, t('today.error')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = async (habitId: string, status: Exclude<HabitStatus, 'PENDING'>) => {
    setPendingAction(`${habitId}:${status}`);
    setError('');

    try {
      await checkHabit(habitId, selectedDate, status);
      setDayHabits((current) =>
        current.map((habit) => (habit.habitId === habitId ? { ...habit, status } : habit)),
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('today.error')));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <section className="space-y-6">
        <div className="surface-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                {t('today.eyebrow')}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {t('today.title')}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                {t('today.description')}
              </p>
            </div>

            <label className="block min-w-[220px]">
              <span className="field-label">{t('today.dateLabel')}</span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="pl-11"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
              </div>
            </label>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
            {error}
          </p>
        ) : null}

        {isLoading ? <div className="surface-card p-6 text-sm text-muted">{t('today.loading')}</div> : null}

        {!isLoading && !error && dayHabits.length === 0 ? (
          <EmptyState description={t('today.empty')} />
        ) : null}

        {!isLoading && dayHabits.length > 0 ? (
          <div className="space-y-4">
            {dayHabits.map((habit) => (
              <div key={habit.habitId} className="surface-card p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{habit.title}</h3>
                      <p className="mt-2 text-sm text-muted">{t('today.statusSection')}</p>
                    </div>
                    <StatusBadge status={habit.status} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {statusActions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                          habit.status === status
                            ? 'bg-primary text-white'
                            : 'border border-border/80 bg-background text-foreground hover:border-primary/30 hover:text-primary'
                        }`}
                        onClick={() => void handleCheck(habit.habitId, status)}
                        disabled={pendingAction === `${habit.habitId}:${status}`}
                      >
                        {pendingAction === `${habit.habitId}:${status}`
                          ? t('common.loading')
                          : t(`status.${status}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <aside className="space-y-6">
        <ProgressCard doneCount={doneCount} totalCount={dayHabits.length} />

        {!isLoading && dayHabits.length > 0 ? (
          <HabitCard
            title={dayHabits[0].title}
            subtitle={t('today.completeAction')}
            status={dayHabits[0].status}
            onPrimaryAction={() => void handleCheck(dayHabits[0].habitId, 'DONE')}
            disabled={pendingAction === `${dayHabits[0].habitId}:DONE`}
          />
        ) : null}
      </aside>
    </div>
  );
}
