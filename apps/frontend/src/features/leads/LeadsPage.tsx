import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { LeadsTable } from './components/LeadsTable';
import { LeadsFilters } from './components/LeadsFilters';
import { CreateLeadModal, EditLeadModal, DeleteLeadModal } from './components/LeadModals';
import { LeadKanbanBoard } from './components/LeadKanbanBoard';
import { useLeads } from './hooks/useLeads';
import { CreateLeadInput, UpdateLeadInput, ILead, LeadStatus } from '@gigflow/shared';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useLeadsFilters } from './hooks/useLeadsFilters';
import { useLeadMutations } from './hooks/useLeadMutations';

export const LeadsPage = () => {
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');

  const {
    filters,
    setSearch,
    setDebouncedSearch,
    setStatus,
    setSource,
    setSort,
    setPage,
    clearFilters,
    hasFilters,
  } = useLeadsFilters();

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    moveMutation,
  } = useLeadMutations();

  const limit = 10;

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ILead | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(handler);
  }, [filters.search, setDebouncedSearch, setPage]);

  const activeQuery = useLeads({
    page: viewMode === 'pipeline' ? 1 : filters.page,
    limit: viewMode === 'pipeline' ? 200 : limit,
    status: filters.status,
    source: filters.source,
    search: filters.debouncedSearch,
    sort: viewMode === 'pipeline' ? 'latest' : filters.sort,
  });

  const leads = activeQuery.data?.data?.leads || [];
  const pagination = activeQuery.data?.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleCreateSubmit = async (data: CreateLeadInput) => {
    await createMutation.mutateAsync(data);
  };

  const handleEditSubmit = async (id: string, data: UpdateLeadInput) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const handleDeleteConfirm = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleMoveLead = async (lead: ILead, nextStatus: LeadStatus) => {
    await moveMutation.mutateAsync({ id: lead.id, status: nextStatus });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="mt-1 text-muted-foreground">
            Manage, score, and move your pipeline with a modern Kanban flow.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-2xl border border-border bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('pipeline')}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                viewMode === 'pipeline' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Pipeline
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Table
            </button>
          </div>

          <Button onClick={() => setIsCreateOpen(true)}>Add Lead</Button>
        </div>
      </div>

      <LeadsFilters
        search={filters.search}
        onSearchChange={setSearch}
        status={filters.status}
        onStatusChange={setStatus}
        source={filters.source}
        onSourceChange={setSource}
        sort={filters.sort}
        onSortChange={(value: string) => setSort(value as 'latest' | 'score' | 'name')}
        onClearFilters={clearFilters}
        hasActiveFilters={hasFilters}
      />

      {activeQuery.isError ? (
        <div className="border border-border rounded-xl bg-card p-6 text-center text-red-500">
          Failed to load leads. Please try again.
        </div>
      ) : (
        <>
          {viewMode === 'pipeline' ? (
            <LeadKanbanBoard
              leads={leads}
              onEdit={(lead) => { setSelectedLead(lead); setIsEditOpen(true); }}
              onMoveLead={handleMoveLead}
              isUpdating={moveMutation.isPending}
              isLoading={activeQuery.isLoading}
            />
          ) : (
            <>
              <LeadsTable
                leads={leads}
                isLoading={activeQuery.isLoading}
                onEdit={(lead) => { setSelectedLead(lead); setIsEditOpen(true); }}
                onDelete={(lead) => { setSelectedLead(lead); setIsDeleteOpen(true); }}
              />

              {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={filters.page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modals */}
      <CreateLeadModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
      />

      <EditLeadModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedLead(null); }}
        lead={selectedLead}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />

      <DeleteLeadModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedLead(null); }}
        lead={selectedLead}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </motion.div>
  );
};
