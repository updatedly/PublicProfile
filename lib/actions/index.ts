'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import type { Policy, Entity } from '../types'

// ─── COMMENTS (public — no auth required) ───────────────────

export async function submitComment(formData: FormData) {
  const supabase = await createClient()

  const policyId = formData.get('policy_id') as string
  const userName = (formData.get('user_name') as string)?.trim()
  const userEmail = (formData.get('user_email') as string)?.trim()
  const text = (formData.get('text') as string)?.trim()

  if (!policyId || !text || !userName) {
    return { error: 'Name and comment text are required.' }
  }

  if (text.length > 2000) {
    return { error: 'Comment must be under 2000 characters.' }
  }

  const { error } = await supabase.from('comments').insert({
    policy_id:  policyId,
    user_name:  userName,
    user_email: userEmail || null,
    text,
  })

  if (error) {
    console.error('submitComment error:', error.message)
    return { error: 'Failed to post comment. Please try again.' }
  }

  revalidatePath(`/policies/${policyId}`)
  return { success: true }
}

// ─── LIKES (public — no auth required) ──────────────────────

export async function likePolicy(policyId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('increment_policy_likes', {
    policy_id: policyId,
  })

  if (error) {
    // Fallback: fetch current and increment manually
    const { data } = await supabase
      .from('policies')
      .select('likes')
      .eq('id', policyId)
      .single()

    if (data) {
      await supabase
        .from('policies')
        .update({ likes: (data.likes ?? 0) + 1 })
        .eq('id', policyId)
    }
  }

  revalidatePath(`/policies/${policyId}`)
  revalidatePath('/')
  return { success: true }
}

// ─── RATINGS (public — no auth required) ────────────────────

export async function submitRating(formData: FormData) {
  const supabase = await createClient()

  const policyId  = formData.get('policy_id') as string
  const userEmail = (formData.get('user_email') as string)?.trim() || 'anonymous'

  const ratings = {
    transparency:   Number(formData.get('transparency'))   || null,
    representation: Number(formData.get('representation')) || null,
    justification:  Number(formData.get('justification'))  || null,
    readiness:      Number(formData.get('readiness'))      || null,
    effectiveness:  Number(formData.get('effectiveness'))  || null,
    ux:             Number(formData.get('ux'))             || null,
    equity:         Number(formData.get('equity'))         || null,
    cost:           Number(formData.get('cost'))           || null,
  }

  const { error } = await supabase.from('ratings').upsert(
    { policy_id: policyId, user_email: userEmail, ratings },
    { onConflict: 'policy_id,user_email' }
  )

  if (error) {
    console.error('submitRating error:', error.message)
    return { error: 'Failed to save rating. Please try again.' }
  }

  revalidatePath(`/policies/${policyId}`)
  return { success: true }
}

// ─── ADMIN — POLICIES ────────────────────────────────────────

export async function createPolicy(formData: FormData) {
  const supabase = await createClient()

  const tags = (formData.get('tags') as string)
    ?.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) ?? []

  const preRatings = {
    transparency:   parseFloat(formData.get('r_transparency') as string) || null,
    representation: parseFloat(formData.get('r_representation') as string) || null,
    justification:  parseFloat(formData.get('r_justification') as string) || null,
    readiness:      parseFloat(formData.get('r_readiness') as string) || null,
  }
  const postRatings = {
    effectiveness: parseFloat(formData.get('r_effectiveness') as string) || null,
    ux:            parseFloat(formData.get('r_ux') as string) || null,
    equity:        parseFloat(formData.get('r_equity') as string) || null,
    cost:          parseFloat(formData.get('r_cost') as string) || null,
  }

  const row = {
    title:          (formData.get('title') as string)?.trim(),
    category:       (formData.get('category') as string)?.trim(),
    date:           (formData.get('date') as string) || null,
    sponsor:        (formData.get('sponsor') as string)?.trim() || 'Unknown',
    party:          (formData.get('party') as string)?.trim() || '',
    tags,
    status:         (formData.get('status') as string) || 'draft',
    intro:          (formData.get('intro') as string)?.trim() || '',
    background:     (formData.get('background') as string)?.trim() || '',
    keydetails:     (formData.get('keydetails') as string)?.trim() || '',
    timeline:       (formData.get('timeline') as string)?.trim() || '',
    structure:      (formData.get('structure') as string)?.trim() || '',
    outcome:        (formData.get('outcome') as string)?.trim() || '',
    outcome_status: (formData.get('outcome_status') as string) || 'pending',
    pre_ratings:    preRatings,
    post_ratings:   postRatings,
    likes:          0,
    refs:           [],
    finance:        null,
  }

  if (!row.title) return { error: 'Title is required.' }

  const { data, error } = await supabase.from('policies').insert(row).select().single()

  if (error) {
    console.error('createPolicy error:', error.message)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true, id: data.id }
}

export async function updatePolicy(id: string, formData: FormData) {
  const supabase = await createClient()

  const tags = (formData.get('tags') as string)
    ?.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) ?? []

  const preRatings = {
    transparency:   parseFloat(formData.get('r_transparency') as string) || null,
    representation: parseFloat(formData.get('r_representation') as string) || null,
    justification:  parseFloat(formData.get('r_justification') as string) || null,
    readiness:      parseFloat(formData.get('r_readiness') as string) || null,
  }
  const postRatings = {
    effectiveness: parseFloat(formData.get('r_effectiveness') as string) || null,
    ux:            parseFloat(formData.get('r_ux') as string) || null,
    equity:        parseFloat(formData.get('r_equity') as string) || null,
    cost:          parseFloat(formData.get('r_cost') as string) || null,
  }

  const row = {
    title:          (formData.get('title') as string)?.trim(),
    category:       (formData.get('category') as string)?.trim(),
    date:           (formData.get('date') as string) || null,
    sponsor:        (formData.get('sponsor') as string)?.trim() || 'Unknown',
    party:          (formData.get('party') as string)?.trim() || '',
    tags,
    status:         (formData.get('status') as string) || 'draft',
    intro:          (formData.get('intro') as string)?.trim() || '',
    background:     (formData.get('background') as string)?.trim() || '',
    keydetails:     (formData.get('keydetails') as string)?.trim() || '',
    timeline:       (formData.get('timeline') as string)?.trim() || '',
    structure:      (formData.get('structure') as string)?.trim() || '',
    outcome:        (formData.get('outcome') as string)?.trim() || '',
    outcome_status: (formData.get('outcome_status') as string) || 'pending',
    pre_ratings:    preRatings,
    post_ratings:   postRatings,
  }

  const { error } = await supabase.from('policies').update(row).eq('id', id)

  if (error) {
    console.error('updatePolicy error:', error.message)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath(`/policies/${id}`)
  revalidatePath('/admin')
  return { success: true }
}

export async function deletePolicy(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('policies').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

export async function publishPolicy(id: string) {
  const supabase = await createClient()
  await supabase.from('policies').update({ status: 'published' }).eq('id', id)
  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

export async function archivePolicy(id: string) {
  const supabase = await createClient()
  await supabase.from('policies').update({ status: 'archived' }).eq('id', id)
  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

// ─── ADMIN — ENTITIES ────────────────────────────────────────

export async function createEntity(formData: FormData) {
  const supabase = await createClient()

  const tags = (formData.get('tags') as string)
    ?.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) ?? []

  const photos = (formData.get('photos') as string)
    ?.split('\n').map(u => u.trim()).filter(Boolean) ?? []

  const row = {
    type:            (formData.get('type') as string) || 'official',
    status:          (formData.get('status') as string) || 'draft',
    name:            (formData.get('name') as string)?.trim(),
    role:            (formData.get('role') as string)?.trim() || '',
    party:           (formData.get('party') as string)?.trim() || '',
    tenure:          (formData.get('tenure') as string)?.trim() || '',
    tags,
    bio:             (formData.get('bio') as string)?.trim() || '',
    background:      (formData.get('background') as string)?.trim() || '',
    timeline:        (formData.get('timeline') as string)?.trim() || '',
    photos,
    media_links:     [],
    linked_policies: [],
    updates:         [],
    budget:          (formData.get('budget') as string)?.trim() || null,
    website:         (formData.get('website') as string)?.trim() || null,
  }

  if (!row.name) return { error: 'Name is required.' }

  const { data, error } = await supabase.from('entities').insert(row).select().single()

  if (error) {
    console.error('createEntity error:', error.message)
    return { error: error.message }
  }

  revalidatePath('/officials')
  revalidatePath('/admin')
  return { success: true, id: data.id }
}

export async function updateEntity(id: string, formData: FormData) {
  const supabase = await createClient()

  const tags = (formData.get('tags') as string)
    ?.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) ?? []

  const photos = (formData.get('photos') as string)
    ?.split('\n').map(u => u.trim()).filter(Boolean) ?? []

  const row = {
    type:     (formData.get('type') as string) || 'official',
    status:   (formData.get('status') as string) || 'draft',
    name:     (formData.get('name') as string)?.trim(),
    role:     (formData.get('role') as string)?.trim() || '',
    party:    (formData.get('party') as string)?.trim() || '',
    tenure:   (formData.get('tenure') as string)?.trim() || '',
    tags,
    bio:      (formData.get('bio') as string)?.trim() || '',
    background: (formData.get('background') as string)?.trim() || '',
    timeline: (formData.get('timeline') as string)?.trim() || '',
    photos,
    budget:   (formData.get('budget') as string)?.trim() || null,
    website:  (formData.get('website') as string)?.trim() || null,
  }

  const { error } = await supabase.from('entities').update(row).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/officials')
  revalidatePath(`/officials/${id}`)
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteEntity(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('entities').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/officials')
  revalidatePath('/admin')
  return { success: true }
}
