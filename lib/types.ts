// ─── Supabase Database Types ────────────────────────────────

export type OutcomeStatus = 'pending' | 'positive' | 'negative'
export type PolicyStatus  = 'draft' | 'published' | 'archived'
export type EntityType    = 'official' | 'institution'
export type EntityStatus  = 'draft' | 'published'

export interface PreRatings {
  transparency:  number | null
  representation: number | null
  justification: number | null
  readiness:     number | null
}

export interface PostRatings {
  effectiveness: number | null
  ux:            number | null
  equity:        number | null
  cost:          number | null
}

export interface Finance {
  totalAmount:    string | null
  source:         string | null
  sourceDetail:   string | null
  donor:          string | null
  disbursed:      string | null
  loan:           string | null
  grant:          string | null
  partnership:    string | null
  notes:          string | null
  fromPublicPurse: boolean | null
  budgetPublic:   boolean | null
  budgetUrl:      string | null
  budgetLabel:    string | null
}

export interface PolicyRef {
  label: string
  url:   string
}

export interface Policy {
  id:             string
  created_at:     string
  title:          string
  category:       string
  date:           string | null
  sponsor:        string
  party:          string
  tags:           string[]
  status:         PolicyStatus
  intro:          string
  background:     string
  keydetails:     string
  timeline:       string
  structure:      string
  outcome:        string
  outcome_status: OutcomeStatus
  pre_ratings:    PreRatings
  post_ratings:   PostRatings
  finance:        Finance | null
  refs:           PolicyRef[]
  likes:          number
}

export interface MediaLink {
  type:   'article' | 'video' | 'statement' | 'press' | 'other'
  title:  string
  source: string
  date:   string | null
  url:    string
}

export interface EntityUpdate {
  date: string
  text: string
}

export interface Entity {
  id:              string
  created_at:      string
  type:            EntityType
  status:          EntityStatus
  name:            string
  role:            string
  party:           string
  tenure:          string
  tags:            string[]
  bio:             string
  background:      string
  timeline:        string
  photos:          string[]
  media_links:     MediaLink[]
  linked_policies: string[]
  updates:         EntityUpdate[]
  budget:          string | null
  website:         string | null
}

export interface Comment {
  id:         string
  created_at: string
  policy_id:  string
  user_name:  string
  user_email: string
  text:       string
  likes:      number
}

export interface Rating {
  id:         string
  created_at: string
  policy_id:  string
  user_email: string
  ratings:    PreRatings & PostRatings
}

export interface Tag {
  code:   string
  label:  string
  desc:   string
  color:  string
  bg:     string
  border: string
}
