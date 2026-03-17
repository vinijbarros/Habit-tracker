import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getErrorMessage } from '../services/error-message';
import { getSummaryRange, type WeeklySummary } from '../services/summary-service';

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonday(reference = new Date()): Date {
  const date = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function shiftWeek(start: string, amount: number): string {
  const [year, month, day] = start.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return formatLocalDate(addDays(date, amount * 7));
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function clampRange(start: string, end: string): { start: string; end: string } {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);

  if (endDate.getTime() < startDate.getTime()) {
    return {
      start,
      end: start,
    };
  }

  const diffInDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);

  if (diffInDays > 6) {
    return {
      start,
      end: formatLocalDate(addDays(startDate, 6)),
    };
  }

  return { start, end };
}

function getConsistencyPercentage(doneCount: number, totalDays: number): number {
  if (totalDays === 0) {
    return 0;
  }

  return Math.round((doneCount / totalDays) * 100);
}

export function SummaryPage() {
  const initialStart = formatLocalDate(getMonday());
  const [range, setRange] = useState(() => ({
    start: initialStart,
    end: formatLocalDate(addDays(parseLocalDate(initialStart), 6)),
  }));
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadSummary(range.start, range.end);
  }, [range.end, range.start]);

  const overviewChartData = useMemo(() => {
    if (!summary) {
      return [];
    }

    const days = summary.habits[0]?.perDay.map((day) => day.date) || [];

    return days.map((date) => {
      const totals = summary.habits.reduce(
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
      );

      return totals;
    });
  }, [summary]);

  const selectedHabit = useMemo(
    () => summary?.habits.find((habit) => habit.habitId === selectedHabitId) || summary?.habits[0] || null,
    [selectedHabitId, summary],
  );

  const consistencyHighlights = useMemo(() => {
    if (!summary || summary.habits.length === 0) {
      return null;
    }

    const enriched = summary.habits.map((habit) => ({
      ...habit,
      consistency: getConsistencyPercentage(habit.doneCount, habit.perDay.length),
    }));

    const mostConsistent = enriched.reduce((best, current) =>
      current.consistency > best.consistency ? current : best,
    );
    const leastConsistent = enriched.reduce((worst, current) =>
      current.consistency < worst.consistency ? current : worst,
    );

    return { mostConsistent, leastConsistent };
  }, [summary]);

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
      setError(getErrorMessage(loadError, 'Could not load weekly summary.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPick = (value: string) => {
    if (!value) {
      return;
    }

    setRange((current) => clampRange(value, current.end));
  };

  const handleEndPick = (value: string) => {
    if (!value) {
      return;
    }

    setRange((current) => clampRange(current.start, value));
  };

  return (
    <div className="summary-layout">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Summary</p>
            <h2>General completion flow</h2>
            <p className="panel-copy">
              Track how the whole habit set behaved across the selected period.
            </p>
          </div>

          <div className="summary-nav">
            <label className="date-field summary-date-field">
              <span>Start date</span>
              <input
                type="date"
                value={range.start}
                onChange={(event) => handleStartPick(event.target.value)}
              />
            </label>
            <label className="date-field summary-date-field">
              <span>End date</span>
              <input
                type="date"
                value={range.end}
                onChange={(event) => handleEndPick(event.target.value)}
              />
            </label>
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                const start = formatLocalDate(getMonday());
                setRange({
                  start,
                  end: formatLocalDate(addDays(parseLocalDate(start), 6)),
                });
              }}
            >
              Current 7 days
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() =>
                setRange((current) => ({
                  start: shiftWeek(current.start, -1),
                  end: shiftWeek(current.end, -1),
                }))
              }
            >
              Previous range
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() =>
                setRange((current) => ({
                  start: shiftWeek(current.start, 1),
                  end: shiftWeek(current.end, 1),
                }))
              }
            >
              Next range
            </button>
          </div>
        </div>

        {isLoading ? <p className="state-message">Loading weekly summary...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {!isLoading && !error && summary ? (
          <>
            <div className="summary-range">
              <strong>{summary.range.start}</strong>
              <span>to</span>
              <strong>{summary.range.end}</strong>
              <span className="summary-hint">Maximum range: 7 days</span>
            </div>

            {summary.habits.length === 0 ? (
              <p className="state-message">No active habits to display for this week.</p>
            ) : (
              <>
                <div className="chart-card">
                  <div className="chart-legend">
                    <span className="chart-legend-item">
                      <span className="chart-legend-dot chart-legend-dot-done" />
                      Done
                    </span>
                    <span className="chart-legend-item">
                      <span className="chart-legend-dot chart-legend-dot-missed" />
                      Missed
                    </span>
                    <span className="chart-legend-item">
                      <span className="chart-legend-dot chart-legend-dot-skipped" />
                      Skipped
                    </span>
                    <span className="chart-legend-item">
                      <span className="chart-legend-dot chart-legend-dot-pending" />
                      Pending
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={overviewChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={(value) => value.slice(5)} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="doneCount" stackId="1" stroke="#235347" fill="#235347" fillOpacity={0.82} />
                      <Area type="monotone" dataKey="missedCount" stackId="1" stroke="#8f2f29" fill="#8f2f29" fillOpacity={0.72} />
                      <Area type="monotone" dataKey="skippedCount" stackId="1" stroke="#375c86" fill="#375c86" fillOpacity={0.72} />
                      <Area type="monotone" dataKey="pendingCount" stackId="1" stroke="#866443" fill="#866443" fillOpacity={0.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {consistencyHighlights ? (
                  <div className="consistency-grid">
                    <article className="consistency-card consistency-card-best">
                      <p className="eyebrow">Most consistent</p>
                      <h3>{consistencyHighlights.mostConsistent.title}</h3>
                      <p className="consistency-score">
                        {consistencyHighlights.mostConsistent.consistency}%
                      </p>
                      <p className="habit-meta">
                        Completed {consistencyHighlights.mostConsistent.doneCount} of{' '}
                        {consistencyHighlights.mostConsistent.perDay.length} days
                      </p>
                    </article>

                    <article className="consistency-card consistency-card-worst">
                      <p className="eyebrow">Needs attention</p>
                      <h3>{consistencyHighlights.leastConsistent.title}</h3>
                      <p className="consistency-score">
                        {consistencyHighlights.leastConsistent.consistency}%
                      </p>
                      <p className="habit-meta">
                        Completed {consistencyHighlights.leastConsistent.doneCount} of{' '}
                        {consistencyHighlights.leastConsistent.perDay.length} days
                      </p>
                    </article>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Habit detail</p>
            <h2>Inspect one habit at a time</h2>
          </div>
          <label className="date-field summary-date-field">
            <span>Habit</span>
            <select
              value={selectedHabit?.habitId || ''}
              onChange={(event) => setSelectedHabitId(event.target.value)}
              disabled={!summary?.habits.length}
            >
              {summary?.habits.map((habit) => (
                <option key={habit.habitId} value={habit.habitId}>
                  {habit.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? <p className="state-message">Preparing habit detail...</p> : null}
        {!isLoading && !error && summary?.habits.length === 0 ? (
          <p className="state-message">The detail panel will appear once you have active habits.</p>
        ) : null}

        {!isLoading && !error && selectedHabit ? (
          <div className="summary-table-list">
            <article className="summary-card">
              <div className="summary-card-header">
                <div>
                  <h3>{selectedHabit.title}</h3>
                  <p className="habit-meta">
                    Done {selectedHabit.doneCount} • Missed {selectedHabit.missedCount} • Skipped {selectedHabit.skippedCount}
                  </p>
                </div>
              </div>

              <div className="detail-stats-grid">
                <div className="detail-stat">
                  <span className="detail-stat-label">Done</span>
                  <strong>{selectedHabit.doneCount}</strong>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">Missed</span>
                  <strong>{selectedHabit.missedCount}</strong>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">Skipped</span>
                  <strong>{selectedHabit.skippedCount}</strong>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">Pending</span>
                  <strong>{selectedHabit.perDay.filter((day) => day.status === 'PENDING').length}</strong>
                </div>
              </div>

              <div className="summary-table-wrap">
                <table className="summary-table">
                  <thead>
                    <tr>
                      {selectedHabit.perDay.map((day) => (
                        <th key={day.date}>{day.date.slice(5)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {selectedHabit.perDay.map((day) => (
                        <td key={day.date}>
                          <span className={`status-badge status-${day.status.toLowerCase()}`}>
                            {day.status}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        ) : null}
      </section>
    </div>
  );
}
