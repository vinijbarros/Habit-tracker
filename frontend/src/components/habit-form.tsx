import { useEffect, useState, type FormEvent } from 'react';
import type { FrequencyType, Habit } from '../types/habit';

interface HabitFormValues {
  title: string;
  frequencyType: FrequencyType;
  weeklyTarget: string;
}

interface HabitFormProps {
  initialHabit?: Habit | null;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (values: { title: string; frequencyType: FrequencyType; weeklyTarget: number | null }) => Promise<void>;
}

function buildInitialValues(habit?: Habit | null): HabitFormValues {
  return {
    title: habit?.title || '',
    frequencyType: habit?.frequencyType || 'DAILY',
    weeklyTarget: habit?.weeklyTarget ? String(habit.weeklyTarget) : '',
  };
}

export function HabitForm({ initialHabit, submitLabel, onCancel, onSubmit }: HabitFormProps) {
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
      setError('Title is required.');
      return;
    }

    const weeklyTarget =
      values.weeklyTarget.trim() === '' ? null : Number.parseInt(values.weeklyTarget, 10);

    if (weeklyTarget !== null && weeklyTarget <= 0) {
      setError('Weekly target must be greater than zero when provided.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: values.title.trim(),
        frequencyType: values.frequencyType,
        weeklyTarget,
      });

      if (!initialHabit) {
        setValues(buildInitialValues(null));
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save habit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <div className="field-grid">
        <label>
          <span>Title</span>
          <input
            type="text"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="Read 20 minutes"
          />
        </label>

        <label>
          <span>Frequency</span>
          <select
            value={values.frequencyType}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                frequencyType: event.target.value as FrequencyType,
              }))
            }
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </label>

        <label>
          <span>Weekly target</span>
          <input
            type="number"
            min="1"
            value={values.weeklyTarget}
            onChange={(event) =>
              setValues((current) => ({ ...current, weeklyTarget: event.target.value }))
            }
            placeholder="Optional"
          />
        </label>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="action-row">
        {onCancel ? (
          <button className="ghost-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
