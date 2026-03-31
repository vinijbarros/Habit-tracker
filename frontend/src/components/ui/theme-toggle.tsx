import { MoonStar, SunMedium } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import { useTheme } from '../../contexts/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const label = `${t('common.theme')}: ${isDark ? t('common.dark') : t('common.light')}`;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card text-foreground shadow-soft transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {isDark ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
    </button>
  );
}
