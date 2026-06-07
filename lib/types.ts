// ─── Core Domain Types ────────────────────────────────────────────────────────

export type PolicyStatus = 'draft' | 'published' | 'archived';
export type OutcomeStatus = 'pending' | 'positive' | 'negative';
export type EntityType = 'official' | 'institution';
export type EntityStatus = 'draft' | 'published';
export type FundingSource = 'Public Purse' | 'External' | 'Loan' | 'Donor' | 'Grant' | 'Mixed' | 'Private';
export type MediaLinkType = 'article' | 'video' | 'statement' | 'press_release' | 'other';

export interface RatingDimensions {
  Transparency?: number;
  Representation?: number;
  Justification?: number;
  Prudence?: number;
  Effectiveness?: number;
  'User Experience'?: number;
  Equity?: number;
  'Cost-Efficiency'?: number;
}

export interface PolicyFinance {
  totalAmount?: string;
  fundingSource?: FundingSource;
  fromPublicPurse?: boolean;
  donorName?: string;
  loanTerms?: string;
  grantDetails?: string;
  disbursedAmount?: string;
  hasBudgetDoc?: boolean;
  budgetDocUrl?: string;
  budgetDocLabel?: string;
  notes?: string;
}

export interface PolicyRef {
  label: string;
  url: string;
}

export interface Policy {
  id: string;
  created_at: string;
  title: string;
  category: string;
  date: string | null;
  sponsor: string;
  party: string;
  tags: string[];
  status: PolicyStatus;
  intro: string;
  background: string;
  keydetails: string;
  timeline: string;
  structure: string;
  outcome: string;
  outcome_status: OutcomeStatus;
  pre_ratings: RatingDimensions;
  post_ratings: RatingDimensions;
  finance: PolicyFinance | null;
  refs: PolicyRef[];
  likes: number;
}

export interface MediaLink {
  type: MediaLinkType;
  title: string;
  source: string;
  date: string;
  url: string;
}

export interface EntityUpdate {
  date: string;
  text: string;
}

export interface Entity {
  id: string;
  created_at: string;
  type: EntityType;
  status: EntityStatus;
  name: string;
  role: string;
  party: string;
  tenure: string;
  tags: string[];
  bio: string;
  background: string;
  timeline: string;
  photos: string[];
  media_links: MediaLink[];
  linked_policies: string[];
  updates: EntityUpdate[];
  budget: string | null;
  website: string | null;
}

export interface Tag {
  id: string;
  created_at: string;
  code: string;
  label: string;
  description: string;
  color: string;
  is_core: boolean;
}

export interface Comment {
  id: string;
  created_at: string;
  policy_id: string;
  user_id: string | null;
  user_name: string;
  user_email: string | null;
  text: string;
  likes: number;
  upvoted_by: string[];
}

export interface Rating {
  id: string;
  created_at: string;
  policy_id: string;
  user_id: string | null;
  user_email: string;
  ratings: RatingDimensions;
}

export const RATING_DIMENSIONS: (keyof RatingDimensions)[] = [
  'Transparency',
  'Representation',
  'Justification',
  'Prudence',
  'Effectiveness',
  'User Experience',
  'Equity',
  'Cost-Efficiency',
];

export const RATING_DIMENSION_DESCRIPTIONS: Record<string, string> = {
  Transparency: 'How open and accessible is information about this policy?',
  Representation: 'Does it represent the interests of ordinary Ghanaians?',
  Justification: 'Is there clear reasoning and evidence behind it?',
  Prudence: 'Was it financially and strategically sensible?',
  Effectiveness: 'Has it achieved or is it likely to achieve its goals?',
  'User Experience': 'How easy is it for citizens to access or benefit?',
  Equity: 'Is the impact fair across different groups?',
  'Cost-Efficiency': 'Does the cost justify the benefit?',
};

export const CORE_TAG_CODES = ['NPP', 'NDC', 'PEP', 'COMP', 'CORR', 'ADM', 'REPU', 'CONT', 'NCOM'];

export const POLICY_CATEGORIES = [
  'Finance & Economy',
  'Health',
  'Education',
  'Infrastructure',
  'Agriculture',
  'Energy',
  'Security & Defence',
  'Governance & Legal',
  'Trade & Investment',
  'Environment',
  'Social Protection',
  'Technology & ICT',
  'Other',
];

export const FUNDING_SOURCES: FundingSource[] = [
  'Public Purse', 'External', 'Loan', 'Donor', 'Grant', 'Mixed', 'Private',
];

export const MEDIA_LINK_TYPES: MediaLinkType[] = [
  'article', 'video', 'statement', 'press_release', 'other',
];
