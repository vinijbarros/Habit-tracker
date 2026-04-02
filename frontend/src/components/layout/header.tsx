import { Menu } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { useLanguage } from '../../contexts/language-context';
import { cn } from '../../lib/cn';
import { LanguageSwitcher } from '../ui/language-switcher';
import { ThemeToggle } from '../ui/theme-toggle';

const mobileNavigation = [
  { to: '/today', key: 'navigation.today' },
  { to: '/habits', key: 'navigation.habits' },
  { to: '/summary', key: 'navigation.summary' },
] as const;

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const pageTitle = t(`header.pageTitles.${location.pathname}`);

  return (
    <header className="space-y-4 rounded-[28px] border border-border/80 bg-card/95 p-4 shadow-soft sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          {onMobileMenuClick ? (
            <button
              type="button"
              onClick={onMobileMenuClick}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-background text-foreground lg:hidden"
              aria-label={t('header.mobileMenu')}
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t('header.dashboard')}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{pageTitle}</h1>
            <p className="mt-2 text-sm text-muted">
              {t('header.greeting')}, {user?.name?.split(' ')[0] ?? 'User'}. {t('header.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="flex items-center gap-3 rounded-full border border-border/80 bg-background px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-white">
              {user?.name?.slice(0, 1).toUpperCase() ?? 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>
      </div>

      <nav className="flex gap-2 overflow-auto lg:hidden">
        {mobileNavigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
                isActive ? 'bg-primary text-white' : 'bg-background text-muted',
              )
            }
          >
            {t(item.key)}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
