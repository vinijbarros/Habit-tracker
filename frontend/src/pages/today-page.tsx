import { useEffect, useMemo, useState } from 'react';
import { checkHabit, getDay } from '../services/day-service';
import { getErrorMessage } from '../services/error-message';
import type { DayHabit, HabitStatus } from '../types/habit';

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const statusActions: Array<Exclude<HabitStatus, 'PENDING'>> = ['DONE', 'SKIPPED', 'MISSED'];

export function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [dayHabits, setDayHabits] = useState<DayHabit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    void loadDay(selectedDate);
  }, [selectedDate]);

  const progress = useMemo(() => {
    const doneCount = dayHabits.filter((habit) => habit.status === 'DONE').length;
    return `${doneCount}/${dayHabits.length}`;
  }, [dayHabits]);

  const loadDay = async (date: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getDay(date);
      setDayHabits(response);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Could not load the selected day.'));
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
      setError(getErrorMessage(submitError, 'Could not update habit status.'));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="dashboard-grid">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Today</p>
            <h2>Check-in board</h2>
          </div>

          <label className="date-field">
            <span>Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>
        </div>

        {isLoading ? <p className="state-message">Loading day status...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {!isLoading && !error && dayHabits.length === 0 ? (
          <p className="state-message">No active habits for this account yet.</p>
        ) : null}

        {!isLoading && dayHabits.length > 0 ? (
          <div className="day-list">
            {dayHabits.map((habit) => (
              <article key={habit.habitId} className="day-card">
                <div>
                  <h3>{habit.title}</h3>
                  <p className={`status-badge status-${habit.status.toLowerCase()}`}>
                    {habit.status}
                  </p>
                </div>

                <div className="status-actions">
                  {statusActions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={
                        habit.status === status ? 'status-button status-button-active' : 'status-button'
                      }
                      onClick={() => void handleCheck(habit.habitId, status)}
                      disabled={pendingAction === `${habit.habitId}:${status}`}
                    >
                      {pendingAction === `${habit.habitId}:${status}` ? 'Saving...' : status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <aside className="panel">
        <p className="eyebrow">Daily progress</p>
        <h2>{progress}</h2>
        <p className="panel-copy">Completed habits for the selected date.</p>
        <div className="progress-card">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width:
                  dayHabits.length > 0
                    ? `${(dayHabits.filter((habit) => habit.status === 'DONE').length / dayHabits.length) * 100}%`
                    : '0%',
              }}
            />
          </div>
          <p className="progress-caption">
            Done: {dayHabits.filter((habit) => habit.status === 'DONE').length} • Pending:{' '}
            {dayHabits.filter((habit) => habit.status === 'PENDING').length}
          </p>
        </div>
      </aside>
    </div>
  );
}
