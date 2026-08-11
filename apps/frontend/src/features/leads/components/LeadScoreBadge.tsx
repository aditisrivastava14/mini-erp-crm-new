import { Info } from 'lucide-react';
import { ILead, scoreLead } from '@gigflow/shared';
import { cn } from '../../../utils/cn';

type LeadScoreInput = Pick<
  ILead,
  'email' | 'source' | 'status' | 'activityTimeline' | 'notes' | 'assignedTo' | 'score' | 'priority' | 'scoreExplanation' | 'scoreBreakdown'
>;

interface LeadScoreBadgeProps {
  lead: LeadScoreInput;
  compact?: boolean;
  className?: string;
}

const priorityStyles = {
  High: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Medium: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Low: 'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-300',
} as const;

export const LeadScoreBadge = ({ lead, compact = false, className }: LeadScoreBadgeProps) => {
  const scoreData = lead.score !== undefined
    ? {
        score: lead.score,
        priority: lead.priority || scoreLead(lead as any).priority,
        explanation: lead.scoreExplanation || scoreLead(lead as any).explanation,
      }
    : scoreLead(lead as any);

  return (
    <div
      title={scoreData.explanation}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        priorityStyles[scoreData.priority],
        compact && 'px-2 py-0.5 text-[11px]',
        className
      )}
    >
      <span>{scoreData.priority}</span>
      <span className="opacity-80">{scoreData.score}</span>
      <Info className="h-3 w-3 opacity-70" />
    </div>
  );
};