import { useEffect, useState, type FormEvent } from 'react';
import { useLanguage } from '../contexts/language-context';
import type { FrequencyType, Habit } from '../types/habit';

interface HabitFormValues {
  title: string;
  frequencyType: FrequencyType;
  weeklyTarget: string;
  points: string;
}

interface HabitFormProps {
  initialHabit?: Habit | null;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (values: {
    title: string;
    frequencyType: FrequencyType;
    weeklyTarget: number | null;
    points: number;
  }) => Promise<void>;
}

function buildInitialValues(habit?: Habit | null): HabitFormValues {
  return {
    title: habit?.title || '',
    frequencyType: habit?.frequencyType || 'DAILY',
    weeklyTarget: habit?.weeklyTarget ? String(habit.weeklyTarget) : '',
    points: String(habit?.points ?? 10),
  };
}

export function HabitForm({ initialHabit, submitLabel, onCancel, onSubmit }: HabitFormProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState<HabitFormValues>(buildInitialValues(initialHabit));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(buildInitialValues(initialHabit));
    setError('');
  }, [initialHabit]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!values.title.trim()) {
      setError(t('habitForm.titleRequired'));
      return;
    }

    const weeklyTarget =
      values.weeklyTarget.trim() === '' ? null : Number.parseInt(values.weeklyTarget, 10);
    const points = Number.parseInt(values.points, 10);

    if (weeklyTarget !== null && weeklyTarget <= 0) {
      setError(t('habitForm.weeklyTargetInvalid'));
      return;
    }

    if (Number.isNaN(points) || points <= 0) {
      setError(t('habitForm.pointsInvalid'));
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: values.title.trim(),
        frequencyType: values.frequencyType,
        weeklyTarget,
        points,
      });

      if (!initialHabit) {
        setValues(buildInitialValues(null));
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('habits.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="field-label" htmlFor="habit-title">
          {t('habitForm.title')}
        </label>
        <input
          id="habit-title"
          type="text"
          value={values.title}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
          placeholder={t('habitForm.titlePlaceholder')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="habit-frequency">
            {t('habitForm.frequency')}
          </label>
          <select
            id="habit-frequency"
            value={values.frequencyType}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                frequencyType: event.target.value as FrequencyType,
              }))
            }
          >
            <option value="DAILY">{t('habits.frequency.DAILY')}</option>
            <option value="WEEKLY">{t('habits.frequency.WEEKLY')}</option>
            <option value="CUSTOM">{t('habits.frequency.CUSTOM')}</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="habit-weekly-target">
            {t('habitForm.weeklyTarget')}
          </label>
          <input
            id="habit-weekly-target"
            type="number"
            min="1"
            value={values.weeklyTarget}
            onChange={(event) =>
              setValues((current) => ({ ...current, weeklyTarget: event.target.value }))
            }
            placeholder={t('habitForm.weeklyTargetPlaceholder')}
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="habit-points">
          {t('habitForm.points')}
        </label>
        <input
          id="habit-points"
          type="number"
          min="1"
          value={values.points}
          onChange={(event) =>
            setValues((current) => ({ ...current, points: event.target.value }))
          }
          placeholder={t('habitForm.pointsPlaceholder')}
        />
      </div>

      {error ? (
        <p className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {onCancel ? (
          <button
            className="rounded-full border border-border/80 bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
            type="button"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </button>
        ) : null}
        <button
          className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-progress disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('common.loading') : submitLabel}
        </button>
      </div>
    </form>
  );
}
