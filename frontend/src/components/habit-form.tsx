import { useEffect, useState, type FormEvent } from 'react';
import { useLanguage } from '../contexts/language-context';
import type { CustomFrequencyPeriod, FrequencyType, Habit } from '../types/habit';

interface HabitFormValues {
  title: string;
  frequencyType: FrequencyType;
  weeklyTarget: string;
  customFrequencyCount: string;
  customFrequencyPeriod: CustomFrequencyPeriod;
  enablePoints: boolean;
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
    customFrequencyCount: number | null;
    customFrequencyPeriod: CustomFrequencyPeriod | null;
    points: number | null;
  }) => Promise<void>;
}

function buildInitialValues(habit?: Habit | null): HabitFormValues {
  return {
    title: habit?.title || '',
    frequencyType: habit?.frequencyType || 'DAILY',
    weeklyTarget: habit?.weeklyTarget ? String(habit.weeklyTarget) : '',
    customFrequencyCount: habit?.customFrequencyCount ? String(habit.customFrequencyCount) : '',
    customFrequencyPeriod: habit?.customFrequencyPeriod || 'WEEKLY',
    enablePoints: Boolean(habit),
    points: habit ? String(habit.points) : '',
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
    const customFrequencyCount =
      values.customFrequencyCount.trim() === ''
        ? null
        : Number.parseInt(values.customFrequencyCount, 10);
    const points = values.enablePoints
      ? values.points.trim() === ''
        ? 10
        : Number.parseInt(values.points, 10)
      : null;

    if (weeklyTarget !== null && weeklyTarget <= 0) {
      setError(t('habitForm.weeklyTargetInvalid'));
      return;
    }

    if (values.frequencyType === 'CUSTOM') {
      if (customFrequencyCount === null || Number.isNaN(customFrequencyCount) || customFrequencyCount <= 0) {
        setError(t('habitForm.customFrequencyCountInvalid'));
        return;
      }
    }

    if (points !== null && (Number.isNaN(points) || points <= 0)) {
      setError(t('habitForm.pointsInvalid'));
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: values.title.trim(),
        frequencyType: values.frequencyType,
        weeklyTarget: values.frequencyType === 'WEEKLY' ? weeklyTarget : null,
        customFrequencyCount: values.frequencyType === 'CUSTOM' ? customFrequencyCount : null,
        customFrequencyPeriod:
          values.frequencyType === 'CUSTOM' ? values.customFrequencyPeriod : null,
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

        {values.frequencyType === 'WEEKLY' ? (
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
        ) : null}
      </div>

      {values.frequencyType === 'CUSTOM' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="habit-custom-frequency-count">
              {t('habitForm.customFrequencyCount')}
            </label>
            <input
              id="habit-custom-frequency-count"
              type="number"
              min="1"
              value={values.customFrequencyCount}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  customFrequencyCount: event.target.value,
                }))
              }
              placeholder={t('habitForm.customFrequencyCountPlaceholder')}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="habit-custom-frequency-period">
              {t('habitForm.customFrequencyPeriod')}
            </label>
            <select
              id="habit-custom-frequency-period"
              value={values.customFrequencyPeriod}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  customFrequencyPeriod: event.target.value as CustomFrequencyPeriod,
                }))
              }
            >
              <option value="DAILY">{t('habitForm.periods.DAILY')}</option>
              <option value="WEEKLY">{t('habitForm.periods.WEEKLY')}</option>
              <option value="MONTHLY">{t('habitForm.periods.MONTHLY')}</option>
            </select>
          </div>
        </div>
      ) : null}

      <label className="flex items-start gap-3 rounded-2xl border border-border/80 bg-background px-4 py-4">
        <input
          type="checkbox"
          checked={values.enablePoints}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              enablePoints: event.target.checked,
              points:
                event.target.checked && current.points.trim() === '' ? '10' : current.points,
            }))
          }
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium text-foreground">
            {t('habitForm.enablePoints')}
          </span>
          <span className="block text-sm text-muted">{t('habitForm.enablePointsHint')}</span>
        </span>
      </label>

      {values.enablePoints ? (
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
      ) : null}

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
