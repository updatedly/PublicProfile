import { createClient } from './supabase/server';
import type { Policy, Entity, Tag, Comment, Rating } from './types';

// ─── Policies ─────────────────────────────────────────────────────────────────

export async function getPolicies(includeUnpublished = false): Promise<Policy[]> {
  const supabase = await createClient();
  let query = supabase.from('policies').select('*').order('created_at', { ascending: false });
  if (!includeUnpublished) query = query.eq('status', 'published');
  const { data, error } = await query;
  if (error) { console.error('getPolicies error:', error); return []; }
  return (data as Policy[]) ?? [];
}

export async function getPolicy(id: string): Promise<Policy | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('policies').select('*').eq('id', id).single();
  if (error) { console.error('getPolicy error:', error); return null; }
  return data as Policy;
}

// ─── Entities ─────────────────────────────────────────────────────────────────

export async function getEntities(includeUnpublished = false): Promise<Entity[]> {
  const supabase = await createClient();
  let query = supabase.from('entities').select('*').order('name', { ascending: true });
  if (!includeUnpublished) query = query.eq('status', 'published');
  const { data, error } = await query;
  if (error) { console.error('getEntities error:', error); return []; }
  return (data as Entity[]) ?? [];
}

export async function getEntity(id: string): Promise<Entity | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('entities').select('*').eq('id', id).single();
  if (error) { console.error('getEntity error:', error); return null; }
  return data as Entity;
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tags').select('*').order('is_core', { ascending: false }).order('label');
  if (error) { console.error('getTags error:', error); return []; }
  return (data as Tag[]) ?? [];
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(policyId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('policy_id', policyId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getComments error:', error); return []; }
  return (data as Comment[]) ?? [];
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

export async function getRatings(policyId: string): Promise<Rating[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('policy_id', policyId);
  if (error) { console.error('getRatings error:', error); return []; }
  return (data as Rating[]) ?? [];
}
