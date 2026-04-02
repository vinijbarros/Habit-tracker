import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <article className="rounded-[24px] border border-border/80 bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
        </div>
        {icon ? <div className="rounded-2xl bg-background p-3 text-primary">{icon}</div> : null}
      </div>
    </article>
  );
}
