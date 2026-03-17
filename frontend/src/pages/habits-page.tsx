import { useEffect, useState } from 'react';
import { HabitForm } from '../components/habit-form';
import { createHabit, deactivateHabit, getHabits, updateHabit } from '../services/habits-service';
import { getErrorMessage } from '../services/error-message';
import type { Habit } from '../types/habit';

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadHabits();
  }, []);

  const loadHabits = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getHabits();
      setHabits(response);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Could not load habits.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (values: {
    title: string;
    frequencyType: Habit['frequencyType'];
    weeklyTarget: number | null;
  }) => {
    try {
      const createdHabit = await createHabit(values);
      setHabits((current) => [createdHabit, ...current]);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Could not create habit.'));
    }
  };

  const handleEdit = async (values: {
    title: string;
    frequencyType: Habit['frequencyType'];
    weeklyTarget: number | null;
  }) => {
    if (!editingHabit) {
      return;
    }

    try {
      const updatedHabit = await updateHabit(editingHabit.id, values);
      setHabits((current) =>
        current.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)),
      );
      setEditingHabit(null);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Could not update habit.'));
    }
  };

  const handleDeactivate = async (habitId: string) => {
    try {
      await deactivateHabit(habitId);
      setHabits((current) => current.filter((habit) => habit.id !== habitId));
      if (editingHabit?.id === habitId) {
        setEditingHabit(null);
      }
    } catch (deactivateError) {
      setError(getErrorMessage(deactivateError, 'Could not deactivate habit.'));
    }
  };

  return (
    <div className="dashboard-grid">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Habits</p>
            <h2>Build your recurring list</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => void loadHabits()}>
            Refresh
          </button>
        </div>

        {isLoading ? <p className="state-message">Loading habits...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {!isLoading && !error && habits.length === 0 ? (
          <p className="state-message">No active habits yet. Create your first one below.</p>
        ) : null}

        {!isLoading && habits.length > 0 ? (
          <div className="habit-list">
            {habits.map((habit) => (
              <article key={habit.id} className="habit-card">
                <div className="habit-card-header">
                  <div>
                    <h3>{habit.title}</h3>
                    <p className="habit-meta">
                      {habit.frequencyType}
                      {habit.weeklyTarget ? ` • target ${habit.weeklyTarget}/week` : ''}
                    </p>
                  </div>
                  <div className="action-row">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => setEditingHabit(habit)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => void handleDeactivate(habit.id)}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <aside className="panel">
        <p className="eyebrow">{editingHabit ? 'Edit habit' : 'New habit'}</p>
        <h2>{editingHabit ? 'Update habit' : 'Create habit'}</h2>
        <p className="panel-copy">
          Keep the form simple. Weekly habits require a weekly target.
        </p>

        <HabitForm
          initialHabit={editingHabit}
          submitLabel={editingHabit ? 'Save changes' : 'Create habit'}
          onCancel={editingHabit ? () => setEditingHabit(null) : undefined}
          onSubmit={editingHabit ? handleEdit : handleCreate}
        />
      </aside>
    </div>
  );
}
