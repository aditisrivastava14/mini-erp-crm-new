import { IActivityTimeline } from '@gigflow/shared';
import { Clock3, User2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface LeadActivityTimelineProps {
  activities?: IActivityTimeline[];
  className?: string;
}

const formatTimestamp = (timestamp: Date | string) =>
  new Intl.DateTimeFormat([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));

const getActorLabel = (performedBy: IActivityTimeline['performedBy']) => {
  if (typeof performedBy === 'string') {
    return 'System';
  }

  return performedBy.name || performedBy.email || 'System';
};

export const LeadActivityTimeline = ({ activities = [], className }: LeadActivityTimelineProps) => {
  if (!activities.length) {
    return (
      <div className={cn('rounded-2xl border border-dashed border-border bg-background/50 p-6 text-sm text-muted-foreground', className)}>
        No activity has been recorded for this lead yet.
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {activities.map((activity, index) => (
        <div key={`${activity.action}-${index}`} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm">
              <User2 className="h-4 w-4 text-primary" />
            </div>
            {index !== activities.length - 1 && <div className="mt-2 h-full w-px flex-1 bg-border" />}
          </div>

          <div className="flex-1 pb-4">
            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Updated by {getActorLabel(activity.performedBy)}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};