import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Mail, Pencil } from 'lucide-react';
import { ILead } from '@gigflow/shared';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';
import { LeadScoreBadge } from './LeadScoreBadge';

interface LeadKanbanCardProps {
  lead: ILead;
  onEdit: (lead: ILead) => void;
  isOverlay?: boolean;
}

const statusClassMap: Record<string, string> = {
  New: 'bg-sky-500/10 text-sky-500',
  Contacted: 'bg-amber-500/10 text-amber-500',
  Qualified: 'bg-emerald-500/10 text-emerald-500',
  Lost: 'bg-rose-500/10 text-rose-500',
};

export const LeadKanbanCard = ({ lead, onEdit, isOverlay = false }: LeadKanbanCardProps) => {
  const draggable = useDraggable({
    id: lead.id,
    data: { lead, status: lead.status },
    disabled: isOverlay,
  });

  const { attributes, listeners, setNodeRef, transform, isDragging } = draggable;

  const style = isOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition: 'transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease',
      };

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      whileHover={{ y: -2 }}
      className={cn(
        'group rounded-2xl border border-border/80 bg-card/95 p-4 shadow-sm transition-all duration-200',
        'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
        isDragging && 'cursor-grabbing opacity-80 ring-2 ring-primary/30'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">{lead.name}</h3>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', statusClassMap[lead.status])}>
              {lead.status}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{lead.email}</span>
          </div>
        </div>

        <button
          type="button"
          {...(isOverlay ? {} : attributes)}
          {...(isOverlay ? {} : listeners)}
          className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-lg border border-border bg-background/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Drag ${lead.name}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {lead.notes && (
        <p className="mt-3 rounded-2xl bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {lead.notes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <LeadScoreBadge lead={lead} compact />
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {lead.source}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {lead.updatedAt ? `Updated ${new Date(lead.updatedAt).toLocaleDateString()}` : 'Recently active'}
        </p>
        <Button variant="ghost" size="sm" onClick={() => onEdit(lead)}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
    </motion.article>
  );
};