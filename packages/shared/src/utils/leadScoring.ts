import { ILead, ILeadScoreSummary, LeadPriority } from '../types/lead';
import { LEAD_STATUS, LEAD_SOURCE } from '../constants/lead';

const GENERIC_DOMAINS = new Set(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com']);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getPriority = (score: number): LeadPriority => {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};

const getSourceScore = (source?: ILead['source']) => {
  switch (source) {
    case LEAD_SOURCE.REFERRAL:
      return 35;
    case LEAD_SOURCE.WEBSITE:
      return 28;
    case LEAD_SOURCE.INSTAGRAM:
      return 18;
    default:
      return 12;
  }
};

const getStatusScore = (status?: ILead['status']) => {
  switch (status) {
    case LEAD_STATUS.QUALIFIED:
      return 38;
    case LEAD_STATUS.CONTACTED:
      return 26;
    case LEAD_STATUS.NEW:
      return 16;
    case LEAD_STATUS.LOST:
      return -20;
    default:
      return 10;
  }
};

const getEngagementScore = (lead: Pick<ILead, 'activityTimeline' | 'notes' | 'assignedTo'>) => {
  const activityCount = lead.activityTimeline?.length || 0;
  let score = 0;

  if (activityCount >= 5) score += 28;
  else if (activityCount >= 3) score += 22;
  else if (activityCount >= 1) score += 14;

  if (lead.notes?.trim()) score += 8;
  if (lead.assignedTo) score += 6;

  return score;
};

const getDomainScore = (email?: string) => {
  if (!email || !email.includes('@')) {
    return 0;
  }

  const domain = email.split('@')[1]?.toLowerCase() || '';
  if (!domain) return 0;

  if (GENERIC_DOMAINS.has(domain)) return 8;
  if (domain.split('.').length > 2) return 18;
  return 25;
};

export const scoreLead = (lead: Pick<ILead, 'email' | 'source' | 'status' | 'activityTimeline' | 'notes' | 'assignedTo'>): ILeadScoreSummary => {
  const source = getSourceScore(lead.source);
  const engagement = getEngagementScore(lead);
  const status = getStatusScore(lead.status);
  const domain = getDomainScore(lead.email);

  const total = clamp(Math.round(source + engagement + status + domain), 0, 100);
  const priority = getPriority(total);

  return {
    score: total,
    priority,
    breakdown: {
      source,
      engagement,
      status,
      domain,
      total,
      priority,
    },
    explanation: `Source ${source}, engagement ${engagement}, status ${status}, domain ${domain}. Total ${total}/100 (${priority}).`,
  };
};