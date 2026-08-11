import { ILead, LEAD_STATUS } from '@gigflow/shared';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';
import { useAuthStore } from '../../../store/useAuthStore';

interface LeadsTableProps {
  leads: ILead[];
  isLoading: boolean;
  onEdit: (lead: ILead) => void;
  onDelete: (lead: ILead) => void;
}

export const LeadsTable = ({ leads, isLoading, onEdit, onDelete }: LeadsTableProps) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const getStatusColor = (status: string) => {
    switch (status) {
      case LEAD_STATUS.NEW:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case LEAD_STATUS.CONTACTED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case LEAD_STATUS.QUALIFIED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case LEAD_STATUS.LOST:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground">No leads found. Create one or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{lead.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{lead.email}</td>
                <td className="px-6 py-4">
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusColor(lead.status))}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{lead.source}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(lead)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(lead)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
