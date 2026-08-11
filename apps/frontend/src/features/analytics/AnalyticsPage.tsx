import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight, Activity, Target, TrendingUp, Users, Clock3 } from 'lucide-react';
import { useAnalyticsOverview } from './hooks/useAnalyticsOverview';
import { cn } from '../../utils/cn';
import { LeadScoreBadge } from '../leads/components/LeadScoreBadge';

const motionContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const motionItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const statusColors: Record<string, string> = {
  New: 'hsl(var(--primary))',
  Contacted: '#f59e0b',
  Qualified: '#22c55e',
  Lost: '#ef4444',
};

const sourceColors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const skeletonCard = 'rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-sm';

const AnalyticsCardSkeleton = () => (
  <div className={cn(skeletonCard, 'p-6') }>
    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
    <div className="mt-4 h-9 w-28 animate-pulse rounded bg-muted" />
    <div className="mt-3 h-3 w-16 animate-pulse rounded bg-muted" />
  </div>
);

export const AnalyticsPage = () => {
  const { data, isLoading, isError } = useAnalyticsOverview();

  const stats = data?.stats;
  const leadQuality = data?.leadQuality;
  const leadsBySource = data?.charts.leadsBySource ?? [];
  const leadsByStatus = data?.charts.leadsByStatus ?? [];
  const monthlyGrowth = data?.charts.monthlyGrowth ?? [];
  const recentActivities = data?.recentActivities ?? [];

  const getActivityActor = (performedBy: string | { id?: string; name?: string; email?: string }) => {
    if (typeof performedBy === 'string') {
      return performedBy;
    }

    return performedBy.name || performedBy.email || 'System';
  };

  const summaryCards = [
    {
      title: 'Total leads',
      value: stats?.totalLeads ?? 0,
      change: 'All captured opportunities',
      icon: Users,
      accent: 'from-sky-500/20 to-cyan-500/10',
      iconColor: 'text-sky-500',
    },
    {
      title: 'Qualified leads',
      value: stats?.qualifiedLeads ?? 0,
      change: `${stats?.conversionRate ?? 0}% conversion rate`,
      icon: Target,
      accent: 'from-emerald-500/20 to-green-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Lost leads',
      value: stats?.lostLeads ?? 0,
      change: 'Needs follow-up review',
      icon: ArrowDownRight,
      accent: 'from-rose-500/20 to-red-500/10',
      iconColor: 'text-rose-500',
    },
    {
      title: 'Conversion rate',
      value: `${stats?.conversionRate ?? 0}%`,
      change: 'Qualified / total leads',
      icon: TrendingUp,
      accent: 'from-violet-500/20 to-indigo-500/10',
      iconColor: 'text-violet-500',
    },
  ];

  return (
    <motion.div
      variants={motionContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={motionItem} className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/20 p-6 md:p-8 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_28%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Activity className="h-3.5 w-3.5" />
              Real-time CRM analytics
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Analytics</h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
                Track lead quality, watch conversion trends, and spot where momentum is building across your pipeline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground">Updated</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                <Clock3 className="h-4 w-4 text-primary" />
                Live overview
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground">Performance</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                Conversion focused
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.section variants={motionContainer} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <AnalyticsCardSkeleton key={index} />)
          : summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={motionItem}
                  whileHover={{ y: -4 }}
                  className={cn(
                    skeletonCard,
                    'relative overflow-hidden p-6 transition-all duration-200 hover:shadow-lg',
                    `bg-gradient-to-br ${card.accent}`
                  )}
                >
                  <div className="absolute inset-0 bg-background/70" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                      <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                        {card.value}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{card.change}</p>
                    </div>
                    <div className={cn('rounded-2xl border border-border bg-background/80 p-3', card.iconColor)}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </motion.section>

      <motion.section variants={motionContainer} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <AnalyticsCardSkeleton key={index} />)
          : [
              { label: 'Average score', value: leadQuality?.averageScore ?? 0, note: 'Lead quality benchmark' },
              { label: 'High priority', value: leadQuality?.highPriority ?? 0, note: 'Best-fit opportunities' },
              { label: 'Medium priority', value: leadQuality?.mediumPriority ?? 0, note: 'Warm prospects' },
              { label: 'Low priority', value: leadQuality?.lowPriority ?? 0, note: 'Needs nurturing' },
            ].map((card) => (
              <motion.div
                key={card.label}
                variants={motionItem}
                whileHover={{ y: -4 }}
                className={cn(skeletonCard, 'relative overflow-hidden p-6 transition-all duration-200 hover:shadow-lg')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                <div className="relative">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{card.value}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{card.note}</p>
                </div>
              </motion.div>
            ))}
      </motion.section>

      <motion.section variants={motionContainer} className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div variants={motionItem} className={cn(skeletonCard, 'p-6')}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Lead quality distribution</h2>
              <p className="text-sm text-muted-foreground">AI-inspired scoring across your funnel.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
          ) : (
            <div className="space-y-4">
              {leadQuality?.distribution.map((bucket) => (
                <div key={bucket.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{bucket.name}</span>
                    <span className="text-muted-foreground">{bucket.value} leads</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        bucket.name === 'High' && 'bg-emerald-500',
                        bucket.name === 'Medium' && 'bg-amber-500',
                        bucket.name === 'Low' && 'bg-slate-500'
                      )}
                      style={{
                        width: `${stats?.totalLeads ? Math.max(8, Math.round((bucket.value / stats.totalLeads) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={motionItem} className={cn(skeletonCard, 'p-6')}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Top scored leads</h2>
              <p className="text-sm text-muted-foreground">Priority-ranked opportunities.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border bg-background/50 p-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-28 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : leadQuality?.topLeads?.length ? (
            <div className="space-y-3">
              {leadQuality.topLeads.map((lead) => (
                <div key={lead.id} className="rounded-2xl border border-border bg-background/60 p-4 transition-colors hover:bg-muted/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                    <LeadScoreBadge
                      lead={{
                        email: lead.email,
                        source: 'Website' as any,
                        status: 'New' as any,
                        activityTimeline: [],
                        score: lead.score,
                        priority: lead.priority,
                        scoreExplanation: `Top scored lead at ${lead.score}/100 (${lead.priority})`,
                      }}
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-background/50 p-8 text-center text-sm text-muted-foreground">
              No scoring data yet.
            </div>
          )}
        </motion.div>
      </motion.section>

      {isError ? (
        <div className={cn(skeletonCard, 'p-8 text-center text-red-500')}>
          Failed to load analytics. Please try again.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <motion.div variants={motionItem} className={cn(skeletonCard, 'p-6')}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Leads by source</h2>
                <p className="text-sm text-muted-foreground">Where your leads are coming from.</p>
              </div>
            </div>
            {isLoading ? (
              <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadsBySource}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={108}
                      paddingAngle={4}
                      stroke="transparent"
                    >
                      {leadsBySource.map((entry, index) => (
                        <Cell key={entry.name} fill={sourceColors[index % sourceColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 12,
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <motion.div variants={motionItem} className={cn(skeletonCard, 'p-6')}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Leads by status</h2>
                <p className="text-sm text-muted-foreground">Pipeline health at a glance.</p>
              </div>
            </div>
            {isLoading ? (
              <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsByStatus} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 12,
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {leadsByStatus.map((entry) => (
                        <Cell key={entry.name} fill={statusColors[entry.name] || 'hsl(var(--primary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <motion.div variants={motionItem} className={cn(skeletonCard, 'p-6 xl:col-span-2')}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Monthly growth</h2>
                <p className="text-sm text-muted-foreground">Lead volume over time.</p>
              </div>
            </div>
            {isLoading ? (
              <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyGrowth} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 12,
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#growthFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <motion.div variants={motionItem} className={cn(skeletonCard, 'p-6 xl:col-span-2')}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recent activities</h2>
                <p className="text-sm text-muted-foreground">Latest actions captured from the pipeline.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-4 rounded-2xl border border-border bg-background/50 p-4">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-2xl border border-border bg-background/60 p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {activity.leadName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium text-foreground">
                          {activity.action} <span className="text-muted-foreground">for</span> {activity.leadName}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Performed by {getActivityActor(activity.performedBy)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background/50 p-8 text-center text-sm text-muted-foreground">
                No recent activity yet.
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
