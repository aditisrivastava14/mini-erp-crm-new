import { LeadStatus, LeadSource } from '../constants/lead';

export type LeadPriority = 'High' | 'Medium' | 'Low';

export interface IActivityTimeline {
  action: string;
  timestamp: Date;
  performedBy: string | { id?: string; name?: string; email?: string };
}

export interface ILeadScoreBreakdown {
  source: number;
  engagement: number;
  status: number;
  domain: number;
  total: number;
  priority: LeadPriority;
}

export interface ILeadScoreSummary {
  score: number;
  priority: LeadPriority;
  breakdown: ILeadScoreBreakdown;
  explanation: string;
}

export interface ILead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  assignedTo?: string; // User ID
  activityTimeline: IActivityTimeline[];
  createdAt?: Date;
  updatedAt?: Date;
  score?: number;
  priority?: LeadPriority;
  scoreBreakdown?: ILeadScoreBreakdown;
  scoreExplanation?: string;
}
