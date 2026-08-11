import { CreateLeadInput, UpdateLeadInput, ILead } from '@gigflow/shared';
import { Button } from '../../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LeadActivityTimeline } from './LeadActivityTimeline';
import { LeadScoreBadge } from './LeadScoreBadge';
import { LeadForm } from './LeadForm';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateModalProps extends ModalProps {
  onSubmit: (data: CreateLeadInput) => Promise<void>;
  isLoading: boolean;
}

export const CreateLeadModal = ({ isOpen, onClose, onSubmit, isLoading }: CreateModalProps) => {
  const handleFormSubmit = async (data: CreateLeadInput) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mx-auto mt-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 lg:px-6">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Create New Lead</h3>
                <p className="mt-1 text-sm text-muted-foreground">Capture the lead with the right source and status from the start.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="-mr-2 -mt-1 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-5 py-5 lg:px-6">
              <LeadForm
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface EditModalProps extends ModalProps {
  lead: ILead | null;
  onSubmit: (id: string, data: UpdateLeadInput) => Promise<void>;
  isLoading: boolean;
}

export const EditLeadModal = ({ isOpen, onClose, lead, onSubmit, isLoading }: EditModalProps) => {
  const handleFormSubmit = async (data: CreateLeadInput | UpdateLeadInput) => {
    if (lead) {
      await onSubmit(lead.id, data as UpdateLeadInput);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && lead && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mx-auto mt-8 w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 lg:px-6">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Edit Lead</h3>
                <p className="mt-1 text-sm text-muted-foreground">Update details, move the lead, and review its activity trail.</p>
              </div>
              <div className="flex items-center gap-3">
                <LeadScoreBadge lead={lead} compact />
                <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="p-5 lg:p-6">
                <LeadForm
                  lead={lead}
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                  onCancel={onClose}
                />
              </div>

              <div className="border-t border-border bg-muted/20 p-5 lg:border-l lg:border-t-0 lg:p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Activity timeline</h4>
                  <p className="mt-1 text-sm text-muted-foreground">Created, updated, and status changes are tracked here.</p>
                </div>
                <LeadActivityTimeline activities={lead.activityTimeline} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface DeleteModalProps extends ModalProps {
  lead: ILead | null;
  onConfirm: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const DeleteLeadModal = ({ isOpen, onClose, lead, onConfirm, isLoading }: DeleteModalProps) => {
  const handleDelete = async () => {
    if (lead) {
      await onConfirm(lead.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && lead && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mx-auto mt-20 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Delete Lead</h3>
              <p className="text-muted-foreground text-sm">
                Are you sure you want to delete <strong>{lead.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-2 border-t border-border bg-muted/50 p-4">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="ghost" onClick={handleDelete} isLoading={isLoading} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
