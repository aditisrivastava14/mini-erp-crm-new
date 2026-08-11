import { DndContext, DragEndEvent, DragOverlay, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { ILead, LeadStatus, LEAD_STATUS } from '@gigflow/shared';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LeadKanbanColumn } from './LeadKanbanColumn';
import { LeadKanbanCard } from './LeadKanbanCard';

interface LeadKanbanBoardProps {
  leads: ILead[];
  onEdit: (lead: ILead) => void;
  onMoveLead: (lead: ILead, status: LeadStatus) => Promise<void>;
  isUpdating: boolean;
  isLoading?: boolean;
}

const LoadingColumn = ({ label }: { label: string }) => (
  <section className="flex min-h-[460px] flex-col rounded-3xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-3 w-14 animate-pulse rounded bg-muted" />
    </div>
    <div className="mt-4 space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border bg-background/60 p-4 shadow-sm">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-9 animate-pulse rounded-full bg-muted/70" />
        </div>
      ))}
    </div>
  </section>
);

export const LeadKanbanBoard = ({ leads, onEdit, onMoveLead, isUpdating, isLoading }: LeadKanbanBoardProps) => {
  const [activeLead, setActiveLead] = useState<ILead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const leadsByStatus = useMemo(() => {
    return Object.values(LEAD_STATUS).reduce<Record<LeadStatus, ILead[]>>((acc, status) => {
      acc[status] = leads.filter((lead) => lead.status === status);
      return acc;
    }, {
      New: [],
      Contacted: [],
      Qualified: [],
      Lost: [],
    });
  }, [leads]);

  const handleDragStart = (event: any) => {
    setActiveLead(event.active.data.current?.lead || null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveLead(null);

    if (!over) return;

    const lead = active.data.current?.lead as ILead | undefined;
    const nextStatus = over.id as LeadStatus;

    if (!lead || lead.status === nextStatus) return;

    await onMoveLead(lead, nextStatus);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-4 xl:grid-cols-4"
      >
        {Object.values(LEAD_STATUS).map((status) => (
          isLoading ? (
            <LoadingColumn key={status} label={status} />
          ) : (
            <LeadKanbanColumn
              key={status}
              status={status}
              leads={leadsByStatus[status]}
              onEdit={onEdit}
            />
          )
        ))}
      </motion.div>

      <DragOverlay>
        {activeLead ? (
          <div className="w-[320px] rotate-1 scale-105 shadow-2xl">
            <LeadKanbanCard lead={activeLead} onEdit={onEdit} isOverlay />
          </div>
        ) : null}
      </DragOverlay>

      {isUpdating && (
        <div className="pointer-events-none fixed bottom-4 right-4 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-lg">
          Updating pipeline...
        </div>
      )}
    </DndContext>
  );
};