import { useDroppable } from '@dnd-kit/core';
import { ILead, LeadStatus } from '@gigflow/shared';
import { cn } from '../../../utils/cn';
import { LeadKanbanCard } from './LeadKanbanCard';

interface LeadKanbanColumnProps {
  status: LeadStatus;
  leads: ILead[];
  onEdit: (lead: ILead) => void;
}

const columnMeta: Record<LeadStatus, { accent: string; ring: string }> = {
  New: { accent: 'from-sky-500/20 to-cyan-500/10', ring: 'border-sky-500/20' },
  Contacted: { accent: 'from-amber-500/20 to-orange-500/10', ring: 'border-amber-500/20' },
  Qualified: { accent: 'from-emerald-500/20 to-green-500/10', ring: 'border-emerald-500/20' },
  Lost: { accent: 'from-rose-500/20 to-red-500/10', ring: 'border-rose-500/20' },
};

export const LeadKanbanColumn = ({ status, leads, onEdit }: LeadKanbanColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  const meta = columnMeta[status];

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex min-h-[460px] flex-col rounded-3xl border bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-200',
        meta.ring,
        isOver && 'scale-[1.01] border-primary/40 shadow-lg shadow-primary/10'
      )}
    >
      <div className={cn('rounded-2xl border border-border bg-gradient-to-br p-4', meta.accent)}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{status}</h3>
            <p className="text-sm text-muted-foreground">{leads.length} leads</p>
          </div>
          <span className="rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/60">
            {status}
          </span>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {leads.length ? (
          leads.map((lead) => <LeadKanbanCard key={lead.id} lead={lead} onEdit={onEdit} />)
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
            Drop a lead here to move it to {status.toLowerCase()}.
          </div>
        )}
      </div>
    </section>
  );
};