import { Activity } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../../contexts/language-context';

interface SummaryChartDatum {
  date: string;
  doneCount: number;
  missedCount: number;
  skippedCount: number;
  pendingCount: number;
}

interface SummaryChartCardProps {
  data: SummaryChartDatum[];
}

export function SummaryChartCard({ data }: SummaryChartCardProps) {
  const { t } = useLanguage();
  const chartLabelMap = {
    doneCount: t('summary.chart.done'),
    missedCount: t('summary.chart.missed'),
    skippedCount: t('summary.chart.skipped'),
    pendingCount: t('summary.chart.pending'),
  } as const;

  return (
    <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Activity className="h-4 w-4" />
            {t('summary.chartTitle')}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{t('summary.chartDescription')}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
          {['done', 'missed', 'skipped', 'pending'].map((key, index) => (
            <span key={key} className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: ['#2563eb', '#14b8a6', '#8b5cf6', '#94a3b8'][index],
                }}
              />
              {t(`summary.chart.${key}`)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -16, right: 8, top: 16, bottom: 0 }}>
            <defs>
              <linearGradient id="doneGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.75} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="missedGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="skippedGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="pendingGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="rgba(148,163,184,0.22)" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={(value) => value.slice(5)} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value, name) => [
                value,
                chartLabelMap[name as keyof typeof chartLabelMap] ?? String(name),
              ]}
              labelFormatter={(value) => String(value)}
            />
            <Area type="monotone" dataKey="doneCount" stackId="1" stroke="#2563eb" fill="url(#doneGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="missedCount" stackId="1" stroke="#14b8a6" fill="url(#missedGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="skippedCount" stackId="1" stroke="#8b5cf6" fill="url(#skippedGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="pendingCount" stackId="1" stroke="#94a3b8" fill="url(#pendingGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
