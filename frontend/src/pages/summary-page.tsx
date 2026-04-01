import { CalendarRange, Flame, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SummaryChartCard } from '../components/habits/summary-chart-card';
import { EmptyState } from '../components/ui/empty-state';
import { StatCard } from '../components/ui/stat-card';
import { StatusBadge } from '../components/ui/status-badge';
import { useLanguage } from '../contexts/language-context';
import { addDays, formatDateInput, getTodayDateInput, parseDateInput } from '../lib/date';
import {
  formatDisplayDate,
  getCompletionRate,
  getCurrentStreak,
} from '../lib/habit';
import { getErrorMessage } from '../services/error-message';
import { getSummaryRange, type WeeklySummary } from '../services/summary-service';

function clampRange(start: string, end: string): { start: string; end: string } {
  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);

  if (endDate.getTime() < startDate.getTime()) {
    return { start, end: start };
  }

  const diffInDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);

  if (diffInDays > 6) {
    return { start, end: formatDateInput(addDays(startDate, 6)) };
  }

  return { start, end };
}

export function SummaryPage() {
  const { language, t } = useLanguage();
  const today = getTodayDateInput();
  const [range, setRange] = useState(() => ({
    start: today,
    end: formatDateInput(addDays(parseDateInput(today), 6)),
  }));
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadSummary(range.start, range.end);
  }, [range.end, range.start]);

  const overviewChartData = useMemo(() => {
    if (!summary) {
      return [];
    }

    const dates = summary.habits[0]?.perDay.map((day) => day.date) || [];

    return dates.map((date) =>
      summary.habits.reduce(
        (accumulator, habit) => {
          const currentDay = habit.perDay.find((day) => day.date === date);
          const status = currentDay?.status || 'PENDING';

          if (status === 'DONE') {
            accumulator.doneCount += 1;
          } else if (status === 'MISSED') {
            accumulator.missedCount += 1;
          } else if (status === 'SKIPPED') {
            accumulator.skippedCount += 1;
          } else {
            accumulator.pendingCount += 1;
          }

          return accumulator;
        },
        {
          date,
          doneCount: 0,
          missedCount: 0,
          skippedCount: 0,
          pendingCount: 0,
        },
      ),
    );
  }, [summary]);

  const selectedHabit = useMemo(
    () => summary?.habits.find((habit) => habit.habitId === selectedHabitId) || summary?.habits[0] || null,
    [selectedHabitId, summary],
  );

  const highlights = useMemo(() => {
    if (!summary || summary.habits.length === 0) {
      return null;
    }

    const enriched = summary.habits.map((habit) => ({
      ...habit,
      consistency: habit.completionRate,
    }));

    const best = enriched.reduce((currentBest, habit) =>
      habit.consistency > currentBest.consistency ? habit : currentBest,
    );
    const worst = enriched.reduce((currentWorst, habit) =>
      habit.consistency < currentWorst.consistency ? habit : currentWorst,
    );

    return { best, worst };
  }, [summary]);

  const aggregateStats = useMemo(() => {
    if (!summary) {
      return {
        done: 0,
        missed: 0,
        skipped: 0,
        pending: 0,
        completionRate: 0,
        currentStreak: 0,
      };
    }

    const done = summary.habits.reduce((accumulator, habit) => accumulator + habit.doneCount, 0);
    const missed = summary.habits.reduce((accumulator, habit) => accumulator + habit.missedCount, 0);
    const skipped = summary.habits.reduce((accumulator, habit) => accumulator + habit.skippedCount, 0);
    const pending = summary.habits.reduce(
      (accumulator, habit) =>
        accumulator + habit.perDay.filter((day) => day.status === 'PENDING').length,
      0,
    );
    const total = done + missed + skipped + pending;

    const byDay = overviewChartData.map((day) => day.doneCount);
    let streak = 0;

    for (let index = byDay.length - 1; index >= 0; index -= 1) {
      if (byDay[index] > 0) {
        streak += 1;
        continue;
      }

      break;
    }

    return {
      done,
      missed,
      skipped,
      pending,
      completionRate: getCompletionRate(done, total),
      currentStreak: streak,
    };
  }, [overviewChartData, summary]);

  const loadSummary = async (start: string, end: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getSummaryRange(start, end);
      setSummary(response);
      setSelectedHabitId((current) => {
        if (response.habits.some((habit) => habit.habitId === current)) {
          return current;
        }

        return response.habits[0]?.habitId || '';
      });
    } catch (loadError) {
      setError(getErrorMessage(loadError, t('summary.summaryError')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-card p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {t('summary.eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              {t('summary.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              {t('summary.description')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
            <label>
              <span className="field-label">{t('common.startDate')}</span>
              <input
                type="date"
                value={range.start}
                onChange={(event) =>
                  setRange((current) => clampRange(event.target.value || current.start, current.end))
                }
              />
            </label>
            <label>
              <span className="field-label">{t('common.endDate')}</span>
              <input
                type="date"
                value={range.end}
                onChange={(event) =>
                  setRange((current) => clampRange(current.start, event.target.value || current.end))
                }
              />
            </label>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2">
            <CalendarRange className="h-4 w-4 text-primary" />
            {t('common.period')}: {range.start} - {range.end}
          </span>
          <span>{t('common.maxRangeHint')}</span>
          <button
            type="button"
            onClick={() => {
              const nextStart = getTodayDateInput();
              setRange({
                start: nextStart,
                end: formatDateInput(addDays(parseDateInput(nextStart), 6)),
              });
            }}
            className="rounded-full border border-border/80 bg-background px-4 py-2 font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
          >
            {t('common.currentRange')}
          </button>
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      ) : null}

      {isLoading ? <div className="surface-card p-6 text-sm text-muted">{t('summary.loading')}</div> : null}

      {!isLoading && !summary?.habits.length ? (
        <EmptyState description={t('summary.noHabits')} />
      ) : null}

      {!isLoading && summary && summary.habits.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t('summary.stats.done')}
              value={aggregateStats.done}
              icon={<Target className="h-5 w-5" />}
            />
            <StatCard
              label={t('summary.stats.completionRate')}
              value={`${aggregateStats.completionRate}%`}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              label={t('summary.stats.currentStreak')}
              value={aggregateStats.currentStreak}
              icon={<Flame className="h-5 w-5" />}
            />
            <StatCard
              label={t('summary.stats.pending')}
              value={aggregateStats.pending}
              icon={<TrendingDown className="h-5 w-5" />}
            />
          </div>

          <SummaryChartCard data={overviewChartData} />

          {highlights ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="surface-card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  {t('summary.consistency.best')}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-foreground">{highlights.best.title}</h3>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-primary">
                  {highlights.best.consistency}%
                </p>
                <p className="mt-3 text-sm text-muted">
                  {t('summary.consistency.completedOf', {
                    done: highlights.best.doneCount,
                    total: highlights.best.targetCount,
                  })}
                </p>
              </article>

              <article className="surface-card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                  {t('summary.consistency.worst')}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-foreground">{highlights.worst.title}</h3>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-accent">
                  {highlights.worst.consistency}%
                </p>
                <p className="mt-3 text-sm text-muted">
                  {t('summary.consistency.completedOf', {
                    done: highlights.worst.doneCount,
                    total: highlights.worst.targetCount,
                  })}
                </p>
              </article>
            </div>
          ) : null}

          <section className="surface-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  {t('summary.detailEyebrow')}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {t('summary.detailTitle')}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {t('summary.detailDescription')}
                </p>
              </div>

              <label className="block min-w-[240px]">
                <span className="field-label">{t('summary.habitSelect')}</span>
                <select
                  value={selectedHabit?.habitId || ''}
                  onChange={(event) => setSelectedHabitId(event.target.value)}
                >
                  {summary.habits.map((habit) => (
                    <option key={habit.habitId} value={habit.habitId}>
                      {habit.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedHabit ? (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard label={t('summary.stats.done')} value={selectedHabit.doneCount} />
                  <StatCard label={t('summary.stats.missed')} value={selectedHabit.missedCount} />
                  <StatCard label={t('summary.stats.skipped')} value={selectedHabit.skippedCount} />
                  <StatCard
                    label={t('summary.stats.currentStreak')}
                    value={getCurrentStreak(selectedHabit.perDay.map((day) => day.status))}
                  />
                </div>

                <div className="mt-6 overflow-hidden rounded-[24px] border border-border/80">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border/80">
                      <thead className="bg-background">
                        <tr>
                          {selectedHabit.perDay.map((day) => (
                            <th
                              key={day.date}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted"
                            >
                              {formatDisplayDate(day.date, language)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/80 bg-card">
                        <tr>
                          {selectedHabit.perDay.map((day) => (
                            <td key={day.date} className="px-4 py-4">
                              <StatusBadge status={day.status} />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
