import { Check, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import type { Habit, HabitStatus } from '../../types/habit';
import { StatusBadge } from '../ui/status-badge';

interface HabitCardProps {
  title: string;
  subtitle: string;
  status?: HabitStatus;
  ctaLabel?: string;
  onPrimaryAction?: () => void;
  onEdit?: () => void;
  onDeactivate?: () => void;
  disabled?: boolean;
  habit?: Habit;
}

export function HabitCard({
  title,
  subtitle,
  status,
  ctaLabel,
  onPrimaryAction,
  onEdit,
  onDeactivate,
  disabled,
}: HabitCardProps) {
  const { t } = useLanguage();

  return (
    <article className="rounded-[28px] border border-border/80 bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm leading-6 text-muted">{subtitle}</p>
          </div>
          {status ? <StatusBadge status={status} /> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onPrimaryAction ? (
            <button
              type="button"
              onClick={onPrimaryAction}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-progress disabled:opacity-70"
            >
              <Check className="h-4 w-4" />
              {ctaLabel ?? t('today.primaryAction')}
            </button>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
              {t('common.edit')}
            </button>
          ) : null}
          {onDeactivate ? (
            <button
              type="button"
              onClick={onDeactivate}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent/30 hover:text-accent"
            >
              <Trash2 className="h-4 w-4" />
              {t('common.deactivate')}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
