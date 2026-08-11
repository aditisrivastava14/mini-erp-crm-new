export const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  LOST: 'Lost',
} as const;

export type LeadStatus = typeof LEAD_STATUS[keyof typeof LEAD_STATUS];

export const LEAD_SOURCE = {
  WEBSITE: 'Website',
  INSTAGRAM: 'Instagram',
  REFERRAL: 'Referral',
} as const;

export type LeadSource = typeof LEAD_SOURCE[keyof typeof LEAD_SOURCE];
