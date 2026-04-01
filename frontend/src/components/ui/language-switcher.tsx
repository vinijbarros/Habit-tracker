import { languageOptions } from '../../i18n';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../contexts/language-context';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-full border border-border/70 bg-card p-1 shadow-soft"
      role="group"
      aria-label={t('common.language')}
    >
      {languageOptions.map((option) => {
        const selected = option.code === language;

        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguage(option.code)}
            aria-pressed={selected}
            aria-label={option.label}
            title={option.label}
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-full text-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              selected
                ? 'bg-primary text-white'
                : 'text-muted hover:bg-background hover:text-foreground',
            )}
          >
            <span aria-hidden="true">{option.flag}</span>
          </button>
        );
      })}
    </div>
  );
}
