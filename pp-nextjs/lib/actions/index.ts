'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import type { Policy, Entity, Tag, PolicyFinance, MediaLink } from '../types';

// ─── Policy Actions ───────────────────────────────────────────────────────────

export async function upsertPolicy(policy: Partial<Policy> & { id?: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('policies')
    .upsert(policy)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/policies/' + (policy.id ?? data.id));
  return data;
}

export async function deletePolicy(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('policies').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
}

// ─── Entity Actions ───────────────────────────────────────────────────────────

export async function upsertEntity(entity: Partial<Entity> & { id?: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('entities')
    .upsert(entity)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/officials');
  revalidatePath('/officials/' + (entity.id ?? data.id));
  return data;
}

export async function deleteEntity(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('entities').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/officials');
}

// ─── Tag Actions ──────────────────────────────────────────────────────────────

export async function upsertTag(tag: Partial<Tag> & { id?: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tags')
    .upsert(tag)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function deleteTag(id: string) {
  const supabase = await createClient();
  // Check core
  const { data: tag } = await supabase.from('tags').select('is_core').eq('id', id).single();
  if (tag?.is_core) throw new Error('Core tags cannot be deleted.');
  const { error } = await supabase.from('tags').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
}

// ─── Comment Actions ──────────────────────────────────────────────────────────

export async function addComment(payload: {
  policy_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  text: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('comments')
    .insert({ ...payload, likes: 0, upvoted_by: [] })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/policies/' + payload.policy_id);
  return data;
}

export async function upvoteComment(commentId: string, userId: string) {
  const supabase = await createClient();
  // Get current
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('likes, upvoted_by')
    .eq('id', commentId)
    .single();
  if (fetchError) throw new Error(fetchError.message);
  const upvotedBy: string[] = comment.upvoted_by ?? [];
  if (upvotedBy.includes(userId)) return; // already upvoted
  const { error } = await supabase
    .from('comments')
    .update({ likes: comment.likes + 1, upvoted_by: [...upvotedBy, userId] })
    .eq('id', commentId);
  if (error) throw new Error(error.message);
}

// ─── Rating Actions ───────────────────────────────────────────────────────────

export async function submitRating(payload: {
  policy_id: string;
  user_id: string;
  user_email: string;
  ratings: Record<string, number>;
}) {
  const supabase = await createClient();
  // Upsert by user + policy
  const { error } = await supabase
    .from('ratings')
    .upsert(
      { ...payload },
      { onConflict: 'policy_id,user_email' }
    );
  if (error) {
    // If unique constraint doesn't exist yet, just insert
    const { error: insertError } = await supabase.from('ratings').insert(payload);
    if (insertError) throw new Error(insertError.message);
  }
  revalidatePath('/policies/' + payload.policy_id);
}
