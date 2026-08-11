import { LeadModel } from '../models/Lead';
import { scoreLead, User } from '@gigflow/shared';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const formatMonthLabel = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return `${MONTH_LABELS[month - 1]} ${year}`;
};

export class AnalyticsService {
  static async getOverview(user: User) {
    const query: any = {};
    if (user.role === 'SALES') {
      query.assignedTo = user.id;
    }

    const leads = await LeadModel.find(query)
      .select('name email source status createdAt activityTimeline notes assignedTo')
      .populate('activityTimeline.performedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter((lead) => lead.status === 'Qualified').length;
    const lostLeads = leads.filter((lead) => lead.status === 'Lost').length;
    const conversionRate = totalLeads ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

    const sourceMap = new Map<string, number>();
    const statusMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();
    const qualityMap = new Map<'High' | 'Medium' | 'Low', number>([
      ['High', 0],
      ['Medium', 0],
      ['Low', 0],
    ]);

    let scoreTotal = 0;

    const activityFeed = leads
      .flatMap((lead) =>
        (lead.activityTimeline || []).map((activity) => ({
          id: `${lead._id}-${activity.timestamp?.toISOString?.() || activity.action}`,
          leadId: String(lead._id),
          leadName: lead.name,
          action: activity.action,
          timestamp: activity.timestamp,
          performedBy: activity.performedBy,
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);

    leads.forEach((lead) => {
      const leadScore = scoreLead(lead as any);
      qualityMap.set(leadScore.priority, (qualityMap.get(leadScore.priority) || 0) + 1);
      scoreTotal += leadScore.score;

      sourceMap.set(lead.source, (sourceMap.get(lead.source) || 0) + 1);
      statusMap.set(lead.status, (statusMap.get(lead.status) || 0) + 1);

      if (lead.createdAt) {
        const monthKey = toMonthKey(new Date(lead.createdAt));
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
      }
    });

    const sortedMonthKeys = Array.from(monthlyMap.keys()).sort();
    const monthlyGrowth = sortedMonthKeys.map((key) => ({
      month: formatMonthLabel(key),
      value: monthlyMap.get(key) || 0,
    }));

    const averageScore = totalLeads ? Math.round(scoreTotal / totalLeads) : 0;

    const qualityBreakdown = {
      averageScore,
      highPriority: qualityMap.get('High') || 0,
      mediumPriority: qualityMap.get('Medium') || 0,
      lowPriority: qualityMap.get('Low') || 0,
      distribution: [
        { name: 'High', value: qualityMap.get('High') || 0 },
        { name: 'Medium', value: qualityMap.get('Medium') || 0 },
        { name: 'Low', value: qualityMap.get('Low') || 0 },
      ],
      topLeads: leads
        .map((lead) => {
          const leadScore = scoreLead(lead as any);
          return {
            id: String(lead._id),
            name: lead.name,
            email: lead.email,
            score: leadScore.score,
            priority: leadScore.priority,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    };

    return {
      stats: {
        totalLeads,
        qualifiedLeads,
        lostLeads,
        conversionRate,
      },
      charts: {
        leadsBySource: Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value })),
        leadsByStatus: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
        monthlyGrowth,
      },
      leadQuality: qualityBreakdown,
      recentActivities: activityFeed,
    };
  }
}