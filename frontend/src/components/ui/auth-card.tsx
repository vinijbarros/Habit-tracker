import type { ReactNode } from 'react';

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-[32px] border border-white/40 bg-card/95 p-8 shadow-soft backdrop-blur xl:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
