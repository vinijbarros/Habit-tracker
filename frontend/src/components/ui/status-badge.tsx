import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import { cn } from '../../lib/cn';
import { statusColorMap, statusIconMap } from '../../lib/status';
import type { HabitStatus } from '../../types/habit';

export function StatusBadge({ status }: { status: HabitStatus }) {
  const { t } = useLanguage();
  const Icon = statusIconMap[status] as LucideIcon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset',
        statusColorMap[status],
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {t(`status.${status}`)}
    </span>
  );
}
