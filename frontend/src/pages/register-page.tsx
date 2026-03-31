import { AxiosError } from 'axios';
import { Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/ui/auth-card';
import { LanguageSwitcher } from '../components/ui/language-switcher';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../contexts/language-context';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.response?.data?.error?.message || fallback;
  }

  return fallback;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/today" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/today', { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('auth.registerFailed')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_26%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden rounded-[36px] border border-white/10 bg-slate-950/90 p-10 text-slate-50 shadow-soft xl:flex xl:flex-col xl:justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-300">
                  {t('common.appName')}
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight">{t('auth.heroTitle')}</h2>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="inline-flex rounded-2xl bg-white/10 p-3 text-teal-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="mt-4 max-w-lg text-base leading-8 text-slate-300">{t('auth.heroCopy')}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-end gap-3 xl:hidden">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <AuthCard
              eyebrow={t('auth.startHere')}
              title={t('auth.createAccount')}
              description={t('auth.registerDescription')}
            >
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="field-label" htmlFor="register-name">
                    {t('auth.name')}
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Vinicius"
                    required
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="register-email">
                    {t('auth.email')}
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="vinicius@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="register-password">
                    {t('auth.password')}
                  </label>
                  <input
                    id="register-password"
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
                  className="w-full rounded-full bg-primary px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-progress disabled:opacity-70"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('auth.registering') : t('auth.registerAction')}
                </button>
              </form>

              <p className="mt-6 text-sm text-muted">
                {t('auth.alreadyAccount')}{' '}
                <Link className="font-medium text-primary" to="/login">
                  {t('navigation.login')}
                </Link>
              </p>
            </AuthCard>
          </div>
        </div>
      </div>
    </section>
  );
}
