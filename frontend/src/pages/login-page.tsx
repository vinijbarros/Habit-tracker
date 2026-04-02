import { AxiosError } from 'axios';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/ui/auth-card';
import { LanguageSwitcher } from '../components/ui/language-switcher';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../contexts/language-context';
import { consumeAuthNotice } from '../services/storage';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.response?.data?.error?.message || fallback;
  }

  return fallback;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/today" replace />;
  }

  useEffect(() => {
    const notice = consumeAuthNotice();

    if (notice) {
      setError(notice);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(nextPath || '/today', { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('auth.loginFailed')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden rounded-[36px] border border-white/10 bg-slate-950/90 p-10 text-slate-50 shadow-soft xl:flex xl:flex-col xl:justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-300">
                  {t('common.appName')}
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight">{t('auth.heroTitle')}</h2>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
            <p className="max-w-lg text-base leading-8 text-slate-300">{t('auth.heroCopy')}</p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-end gap-3 xl:hidden">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <AuthCard
              eyebrow={t('auth.welcomeBack')}
              title={t('auth.signIn')}
              description={t('auth.loginDescription')}
            >
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="field-label" htmlFor="login-email">
                    {t('auth.email')}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="vinicius@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="login-password">
                    {t('auth.password')}
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="123456"
                    required
                  />
                </div>

                {error ? (
                  <p className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
                    {error}
                  </p>
                ) : null}

                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-progress disabled:opacity-70"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('auth.signingIn') : t('auth.signInAction')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="mt-6 text-sm text-muted">
                {t('auth.noAccount')}{' '}
                <Link className="font-medium text-primary" to="/register">
                  {t('navigation.register')}
                </Link>
              </p>
            </AuthCard>
          </div>
        </div>
      </div>
    </section>
  );
}
