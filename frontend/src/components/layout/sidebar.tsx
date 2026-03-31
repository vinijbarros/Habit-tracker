import { BarChart3, CalendarCheck2, ListTodo } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/language-context';
import { cn } from '../../lib/cn';

const navigation = [
  { to: '/today', icon: CalendarCheck2, key: 'navigation.today' },
  { to: '/habits', icon: ListTodo, key: 'navigation.habits' },
  { to: '/summary', icon: BarChart3, key: 'navigation.summary' },
] as const;

export function Sidebar() {
  const { t } = useLanguage();

  return (
    <aside className="hidden w-full max-w-[280px] shrink-0 lg:block" aria-label={t('sidebar.label')}>
      <div className="sticky top-6 flex min-h-[calc(100vh-3rem)] flex-col rounded-[32px] border border-border/80 bg-card/95 p-6 shadow-soft">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
            HT
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{t('common.appName')}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{t('sidebar.tagline')}</p>
        </div>

        <nav className="mt-8 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-muted hover:bg-background hover:text-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.key)}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
