import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';

export interface AnalyticsStatSet {
  totalLeads: number;
  qualifiedLeads: number;
  lostLeads: number;
  conversionRate: number;
}

export interface AnalyticsChartItem {
  name: string;
  value: number;
}

export interface AnalyticsMonthItem {
  month: string;
  value: number;
}

export interface AnalyticsActivityItem {
  id: string;
  leadId: string;
  leadName: string;
  action: string;
  timestamp: string;
  performedBy: string | { id?: string; name?: string; email?: string };
}

export interface AnalyticsOverviewResponse {
  stats: AnalyticsStatSet;
  leadQuality: {
    averageScore: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    distribution: AnalyticsChartItem[];
    topLeads: Array<{
      id: string;
      name: string;
      email: string;
      score: number;
      priority: 'High' | 'Medium' | 'Low';
    }>;
  };
  charts: {
    leadsBySource: AnalyticsChartItem[];
    leadsByStatus: AnalyticsChartItem[];
    monthlyGrowth: AnalyticsMonthItem[];
  };
  recentActivities: AnalyticsActivityItem[];
}

const fetchAnalyticsOverview = async (): Promise<AnalyticsOverviewResponse> => {
  const response = await api.get('/analytics/overview');
  return response.data.data;
};

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics-overview'],
    queryFn: fetchAnalyticsOverview,
  });
};