import { Inbox } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-border/80 bg-card/70 px-6 py-12 text-center shadow-soft">
      <div className="mb-4 rounded-2xl bg-background p-4 text-primary">
        <Inbox className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title ?? t('emptyState.title')}</h3>
      <p className="mt-2 max-w-md text-sm text-muted">{description ?? t('emptyState.description')}</p>
    </div>
  );
}
