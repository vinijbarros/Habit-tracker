import { CheckCircle2, CircleDashed } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';

interface ProgressCardProps {
  doneCount: number;
  totalCount: number;
}

export function ProgressCard({ doneCount, totalCount }: ProgressCardProps) {
  const { t } = useLanguage();
  const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-soft">
      <p className="text-sm font-medium text-muted">{t('today.progressTitle')}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {t('today.progressLabel', { done: doneCount, total: totalCount })}
      </h2>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all"
          style={{ width: `${completionRate}%` }}
        />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {t('today.doneCount')}
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">{doneCount}</p>
        </div>
        <div className="rounded-2xl bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <CircleDashed className="h-4 w-4 text-muted" />
            {t('today.pendingCount')}
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">{Math.max(totalCount - doneCount, 0)}</p>
        </div>
      </div>
    </section>
  );
}
