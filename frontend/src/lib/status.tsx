import {
  CheckCircle2,
  CircleDashed,
  FastForward,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { HabitStatus } from '../types/habit';

export const statusIconMap: Record<HabitStatus, LucideIcon> = {
  DONE: CheckCircle2,
  PENDING: CircleDashed,
  SKIPPED: FastForward,
  MISSED: XCircle,
};

export const statusColorMap: Record<HabitStatus, string> = {
  DONE: 'bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-400/20',
  PENDING:
    'bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:bg-slate-300/10 dark:text-slate-200 dark:ring-slate-300/20',
  SKIPPED:
    'bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:bg-violet-400/10 dark:text-violet-200 dark:ring-violet-400/20',
  MISSED:
    'bg-teal-500/10 text-teal-700 ring-teal-500/20 dark:bg-teal-400/10 dark:text-teal-200 dark:ring-teal-400/20',
};
