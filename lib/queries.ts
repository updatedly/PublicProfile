import { createClient } from './supabase/server'
import type { Policy, Entity, Comment, Rating } from './types'

// ─── POLICIES ───────────────────────────────────────────────

export async function getPolicies(): Promise<Policy[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('status', 'published')
    .order('date', { ascending: false })

  if (error) {
    console.error('getPolicies error:', error.message)
    return []
  }
  return (data as Policy[]) ?? []
}

export async function getAllPolicies(): Promise<Policy[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllPolicies error:', error.message)
    return []
  }
  return (data as Policy[]) ?? []
}

export async function getPolicyById(id: string): Promise<Policy | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Policy
}

// ─── ENTITIES ───────────────────────────────────────────────

export async function getEntities(): Promise<Entity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('status', 'published')
    .order('name', { ascending: true })

  if (error) {
    console.error('getEntities error:', error.message)
    return []
  }
  return (data as Entity[]) ?? []
}

export async function getAllEntities(): Promise<Entity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('getAllEntities error:', error.message)
    return []
  }
  return (data as Entity[]) ?? []
}

export async function getEntityById(id: string): Promise<Entity | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Entity
}

// ─── COMMENTS ───────────────────────────────────────────────

export async function getCommentsByPolicy(policyId: string): Promise<Comment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('policy_id', policyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getCommentsByPolicy error:', error.message)
    return []
  }
  return (data as Comment[]) ?? []
}

// ─── RATINGS ────────────────────────────────────────────────

export async function getRatingsByPolicy(policyId: string): Promise<Rating[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('policy_id', policyId)

  if (error) {
    console.error('getRatingsByPolicy error:', error.message)
    return []
  }
  return (data as Rating[]) ?? []
}

// ─── STATS ──────────────────────────────────────────────────

export async function getStats() {
  const supabase = await createClient()

  const [policiesRes, entitiesRes, commentsRes] = await Promise.all([
    supabase.from('policies').select('id', { count: 'exact' }).eq('status', 'published'),
    supabase.from('entities').select('id', { count: 'exact' }).eq('status', 'published'),
    supabase.from('comments').select('id', { count: 'exact' }),
  ])

  return {
    policies:  policiesRes.count  ?? 0,
    entities:  entitiesRes.count  ?? 0,
    comments:  commentsRes.count  ?? 0,
  }
}
