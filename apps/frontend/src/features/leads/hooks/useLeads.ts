import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { LeadStatus, LeadSource } from '@gigflow/shared';

export interface UseLeadsParams {
  page?: number;
  limit?: number;
  status?: LeadStatus | '';
  source?: LeadSource | '';
  search?: string;
  sort?: string;
}

const fetchLeads = async (params: UseLeadsParams) => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
  );
  
  const response = await api.get('/leads', { params: filteredParams });
  return response.data;
};

export const useLeads = (params: UseLeadsParams) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => fetchLeads(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
};
