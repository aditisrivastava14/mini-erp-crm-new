import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ILead } from '@gigflow/shared';
import { CreateLeadSchema, UpdateLeadSchema } from '@gigflow/shared';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useAuthStore } from '../../../store/useAuthStore';
import api from '../../../lib/axios';

interface LeadFormProps {
  lead?: ILead | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

const INPUT_CLASSES = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed';
const LABEL_CLASSES = 'block text-sm font-medium text-foreground mb-2';

export const LeadForm = ({ lead, onSubmit, isLoading, onCancel }: LeadFormProps) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/auth/users').then(({ data }) => setUsers(data.data)).catch(console.error);
    }
  }, [isAdmin]);

  const isEditing = !!lead;
  const schema = isEditing ? UpdateLeadSchema : CreateLeadSchema;

  const getDefaultValues = (lead: any) => {
    if (!lead) return { name: '', email: '', status: 'New', source: 'Website', notes: '' };
    return {
      ...lead,
      assignedTo: lead.assignedTo ? (typeof lead.assignedTo === 'object' ? (lead.assignedTo.id || lead.assignedTo._id) : lead.assignedTo) : ''
    };
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(lead),
  });

  useEffect(() => {
    reset(getDefaultValues(lead));
  }, [lead, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className={LABEL_CLASSES}>
          Name
        </label>
        <input
          id="name"
          placeholder="Lead name"
          className={INPUT_CLASSES}
          disabled={isLoading}
          {...register('name')}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-xs text-red-500">
            {errors.name.message as string}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={LABEL_CLASSES}>
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="lead@example.com"
          className={INPUT_CLASSES}
          disabled={isLoading}
          {...register('email')}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-500">
            {errors.email.message as string}
          </p>
        )}
      </div>

      {/* Status and Source (Side by side) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className={LABEL_CLASSES}>
            Status
          </label>
          <select
            id="status"
            className={INPUT_CLASSES}
            disabled={isLoading}
            {...register('status')}
            aria-label="Lead status"
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div>
          <label htmlFor="source" className={LABEL_CLASSES}>
            Source
          </label>
          <select
            id="source"
            className={INPUT_CLASSES}
            disabled={isLoading}
            {...register('source')}
            aria-label="Lead source"
          >
            <option value="Website">Website</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Referral">Referral</option>
            <option value="Social">Social Media</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={LABEL_CLASSES}>
          Notes
        </label>
        <textarea
          id="notes"
          placeholder="Add any notes about this lead..."
          rows={4}
          className={`${INPUT_CLASSES} resize-none`}
          disabled={isLoading}
          {...register('notes')}
        />
      </div>

      {isAdmin && (
        <div>
          <label htmlFor="assignedTo" className={LABEL_CLASSES}>
            Assigned To
          </label>
          <select
            id="assignedTo"
            className={INPUT_CLASSES}
            disabled={isLoading}
            {...register('assignedTo')}
            aria-label="Assign to user"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
          {isLoading && <Spinner className="h-4 w-4" />}
          {isEditing ? 'Save Changes' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
};
