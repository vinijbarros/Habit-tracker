import { Plus, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HabitCard } from '../components/habits/habit-card';
import { HabitForm } from '../components/habit-form';
import { EmptyState } from '../components/ui/empty-state';
import { useLanguage } from '../contexts/language-context';
import { getFrequencyLabel } from '../lib/habit';
import { createHabit, deactivateHabit, getHabits, updateHabit } from '../services/habits-service';
import { getErrorMessage } from '../services/error-message';
import type { Habit } from '../types/habit';

export function HabitsPage() {
  const { t } = useLanguage();
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
      setError(getErrorMessage(loadError, t('habits.error')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (values: {
    title: string;
    frequencyType: Habit['frequencyType'];
    weeklyTarget: number | null;
    customFrequencyCount: number | null;
    customFrequencyPeriod: Habit['customFrequencyPeriod'];
    points: number | null;
  }) => {
    try {
      const createdHabit = await createHabit({
        title: values.title,
        frequencyType: values.frequencyType,
        weeklyTarget: values.weeklyTarget,
        customFrequencyCount: values.customFrequencyCount,
        customFrequencyPeriod: values.customFrequencyPeriod,
        ...(values.points !== null ? { points: values.points } : {}),
      });
      setHabits((current) => [createdHabit, ...current]);
    } catch (submitError) {
      throw new Error(getErrorMessage(submitError, t('habits.createError')));
    }
  };

  const handleEdit = async (values: {
    title: string;
    frequencyType: Habit['frequencyType'];
    weeklyTarget: number | null;
    customFrequencyCount: number | null;
    customFrequencyPeriod: Habit['customFrequencyPeriod'];
    points: number | null;
  }) => {
    if (!editingHabit) {
      return;
    }

    try {
      const updatedHabit = await updateHabit(editingHabit.id, {
        title: values.title,
        frequencyType: values.frequencyType,
        weeklyTarget: values.weeklyTarget,
        customFrequencyCount: values.customFrequencyCount,
        customFrequencyPeriod: values.customFrequencyPeriod,
        ...(values.points !== null ? { points: values.points } : {}),
      });
      setHabits((current) =>
        current.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)),
      );
      setEditingHabit(null);
    } catch (submitError) {
      throw new Error(getErrorMessage(submitError, t('habits.updateError')));
    }
  };

  const handleDeactivate = async (habitId: string) => {
    try {
      await deactivateHabit(habitId);
      setHabits((current) => current.filter((habit) => habit.id !== habitId));
      if (editingHabit?.id === habitId) {
        setEditingHabit(null);
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('habits.deactivateError')));
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="space-y-6">
        <div className="surface-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                {t('habits.eyebrow')}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {t('habits.title')}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                {t('habits.description')}
              </p>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
              type="button"
              onClick={() => void loadHabits()}
            >
              <RefreshCcw className="h-4 w-4" />
              {t('common.refresh')}
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="surface-card p-6 text-sm text-muted">{t('habits.loading')}</div>
        ) : null}

        {!isLoading && habits.length === 0 ? (
          <EmptyState description={t('habits.empty')} />
        ) : null}

        {!isLoading && habits.length > 0 ? (
          <div className="space-y-4">
            {habits.map((habit) => {
              const frequencyLabel = getFrequencyLabel(habit.frequencyType, t);
              const customFrequencyLabel =
                habit.frequencyType === 'CUSTOM' &&
                habit.customFrequencyCount &&
                habit.customFrequencyPeriod
                  ? t('habits.customTargetPerPeriod', {
                      count: habit.customFrequencyCount,
                      period: t(`habitForm.periods.${habit.customFrequencyPeriod}`),
                    })
                  : null;
              const weeklyLabel =
                habit.frequencyType === 'WEEKLY' && habit.weeklyTarget
                  ? t('habits.targetPerWeek', { count: habit.weeklyTarget })
                  : null;
              const subtitle = [frequencyLabel, weeklyLabel, customFrequencyLabel, t('habits.pointsValue', { count: habit.points })]
                .filter(Boolean)
                .join(' • ');

              return (
                <HabitCard
                  key={habit.id}
                  title={habit.title}
                  subtitle={subtitle}
                  onEdit={() => setEditingHabit(habit)}
                  onDeactivate={() => void handleDeactivate(habit.id)}
                />
              );
            })}
          </div>
        ) : null}
      </section>

      <aside className="surface-card h-fit p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {editingHabit ? t('habits.editTitle') : t('habits.createTitle')}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">
              {editingHabit ? t('habits.editTitle') : t('habits.panelTitle')}
            </h3>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted">{t('habits.formDescription')}</p>

        <div className="mt-6">
          <HabitForm
            initialHabit={editingHabit}
            submitLabel={editingHabit ? t('habits.saveAction') : t('habits.createAction')}
            onCancel={editingHabit ? () => setEditingHabit(null) : undefined}
            onSubmit={editingHabit ? handleEdit : handleCreate}
          />
        </div>
      </aside>
    </div>
  );
}
