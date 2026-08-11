import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateLeadInput, UpdateLeadInput, ILead, LeadStatus } from '@gigflow/shared';
import api from '../../../lib/axios';
import { toast } from 'sonner';



export const useLeadMutations = () => {
  const queryClient = useQueryClient();

  const updateCachedLeads = (updater: (lead: ILead) => ILead) => {
    queryClient.setQueriesData({ queryKey: ['leads'] }, (oldData: any) => {
      if (!oldData?.data?.leads) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          leads: oldData.data.leads.map((lead: ILead) => updater(lead)),
        },
      };
    });
  };

  const createMutation = useMutation({
    mutationFn: (newLead: CreateLeadInput) => api.post('/leads', newLead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      toast.success('Lead created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create lead');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) =>
      api.patch(`/leads/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update lead');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete lead');
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      api.patch(`/leads/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ['leads'] });
      updateCachedLeads((lead) => (lead.id === id ? { ...lead, status } : lead));
      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error('Failed to move lead. Please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      toast.success('Lead status updated');
    },
  });

  const isLoading =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    moveMutation,
    isLoading,
  };
};
