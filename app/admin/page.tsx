'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Policy, Entity, Tag, MediaLink, PolicyFinance, RatingDimensions, PolicyRef, EntityUpdate } from '@/lib/types';
import {
  RATING_DIMENSIONS, POLICY_CATEGORIES, FUNDING_SOURCES, MEDIA_LINK_TYPES, CORE_TAG_CODES
} from '@/lib/types';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
const ANTH_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_KEY;
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function supa(table: string, method: string, body?: unknown, id?: string) {
  const url = `${SUPA_URL}/rest/v1/${table}${id ? `?id=eq.${id}` : ''}`;
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

function blankPolicy(): Partial<Policy> {
  return {
    title: '', category: '', date: null, sponsor: '', party: '', tags: [],
    status: 'draft', intro: '', background: '', keydetails: '', timeline: '',
    structure: '', outcome: '', outcome_status: 'pending',
    pre_ratings: {}, post_ratings: {}, finance: {}, refs: [], likes: 0,
  };
}

function blankEntity(): Partial<Entity> {
  return {
    type: 'official', status: 'draft', name: '', role: '', party: '', tenure: '',
    tags: [], bio: '', background: '', timeline: '',
    photos: [], media_links: [], linked_policies: [], updates: [],
    budget: '', website: '',
  };
}

function blankTag(): Partial<Tag> {
  return { code: '', label: '', description: '', color: '#6b7280', is_core: false };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TagSelector({ value, onChange, allTags }: { value: string[]; onChange: (v: string[]) => void; allTags: Tag[] }) {
  const toggle = (code: string) => {
    onChange(value.includes(code) ? value.filter(c => c !== code) : [...value, code]);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {allTags.map(tag => (
        <button
          key={tag.code}
          type="button"
          onClick={() => toggle(tag.code)}
          style={{
            padding: '0.2em 0.6em',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            border: '2px solid',
            borderColor: value.includes(tag.code) ? tag.color : 'var(--border)',
            background: value.includes(tag.code) ? tag.color + '22' : 'var(--bg-4)',
            color: value.includes(tag.code) ? tag.color : 'var(--text-3)',
            transition: 'all 0.15s',
            minHeight: '32px',
          }}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}

function RatingInputGroup({ label, value, onChange }: {
  label: string; value: RatingDimensions; onChange: (v: RatingDimensions) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <div className="form-label">{label}</div>
      {RATING_DIMENSIONS.map(dim => (
        <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: '130px', fontSize: '0.8rem', color: 'var(--text-2)', flexShrink: 0 }}>{dim}</span>
          <input
            type="range" min="0" max="10" step="0.5"
            value={(value as Record<string, number>)[dim] ?? 0}
            onChange={e => onChange({ ...value, [dim]: parseFloat(e.target.value) })}
            style={{ flex: 1, accentColor: 'var(--accent)' }}
          />
          <span style={{ width: '32px', textAlign: 'right', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
            {((value as Record<string, number>)[dim] ?? 0).toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

function RefsEditor({ value, onChange }: { value: PolicyRef[]; onChange: (v: PolicyRef[]) => void }) {
  const add = () => onChange([...value, { label: '', url: '' }]);
  const update = (i: number, field: keyof PolicyRef, v: string) => {
    const next = [...value];
    next[i] = { ...next[i], [field]: v };
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  return (
    <div>
      <div className="form-label">References</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {value.map((ref, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <input className="form-input" placeholder="Label" value={ref.label} onChange={e => update(i, 'label', e.target.value)} style={{ flex: 1 }} />
            <input className="form-input" placeholder="URL" value={ref.url} onChange={e => update(i, 'url', e.target.value)} style={{ flex: 2 }} />
            <button type="button" onClick={() => remove(i)} className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}>✕</button>
          </div>
        ))}
        <button type="button" onClick={add} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>+ Add Reference</button>
      </div>
    </div>
  );
}

function FinanceEditor({ value, onChange }: { value: PolicyFinance; onChange: (v: PolicyFinance) => void }) {
  const upd = (k: keyof PolicyFinance, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div className="form-label">Finance & Accountability</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
        <div className="form-group">
          <label className="form-label">Total Amount</label>
          <input className="form-input" placeholder="e.g. GHS 2.4 billion" value={value.totalAmount ?? ''} onChange={e => upd('totalAmount', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Funding Source</label>
          <select className="form-select" value={value.fundingSource ?? ''} onChange={e => upd('fundingSource', e.target.value)}>
            <option value="">Select…</option>
            {FUNDING_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Amount Disbursed</label>
          <input className="form-input" placeholder="e.g. GHS 800 million" value={value.disbursedAmount ?? ''} onChange={e => upd('disbursedAmount', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Donor / Funder Name</label>
          <input className="form-input" placeholder="e.g. World Bank" value={value.donorName ?? ''} onChange={e => upd('donorName', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Loan Terms</label>
          <input className="form-input" placeholder="e.g. 3.5% over 20 years" value={value.loanTerms ?? ''} onChange={e => upd('loanTerms', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Grant Details</label>
          <input className="form-input" placeholder="e.g. EU grant, no repayment" value={value.grantDetails ?? ''} onChange={e => upd('grantDetails', e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <label className="form-checkbox">
          <input type="checkbox" checked={!!value.fromPublicPurse} onChange={e => upd('fromPublicPurse', e.target.checked)} />
          <span style={{ fontSize: '0.875rem' }}>From Public Purse?</span>
        </label>
        <label className="form-checkbox">
          <input type="checkbox" checked={!!value.hasBudgetDoc} onChange={e => upd('hasBudgetDoc', e.target.checked)} />
          <span style={{ fontSize: '0.875rem' }}>Official Budget Doc Available?</span>
        </label>
      </div>
      {value.hasBudgetDoc && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
          <div className="form-group">
            <label className="form-label">Doc Label</label>
            <input className="form-input" placeholder="e.g. 2023 Budget Statement" value={value.budgetDocLabel ?? ''} onChange={e => upd('budgetDocLabel', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Doc URL</label>
            <input className="form-input" placeholder="https://…" value={value.budgetDocUrl ?? ''} onChange={e => upd('budgetDocUrl', e.target.value)} />
          </div>
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Finance Notes</label>
        <textarea className="form-textarea" rows={2} placeholder="Any additional financial context…" value={value.notes ?? ''} onChange={e => upd('notes', e.target.value)} />
      </div>
    </div>
  );
}

function MediaLinksEditor({ value, onChange }: { value: MediaLink[]; onChange: (v: MediaLink[]) => void }) {
  const add = () => onChange([...value, { type: 'article', title: '', source: '', date: '', url: '' }]);
  const update = (i: number, field: keyof MediaLink, v: string) => {
    const next = [...value];
    next[i] = { ...next[i], [field]: v };
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  return (
    <div>
      <div className="form-label">Media & Press Links</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {value.map((link, i) => (
          <div key={i} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select className="form-select" value={link.type} onChange={e => update(i, 'type', e.target.value)} style={{ width: 'auto', flex: '0 0 140px' }}>
                {MEDIA_LINK_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
              <input className="form-input" placeholder="Title" value={link.title} onChange={e => update(i, 'title', e.target.value)} style={{ flex: 2, minWidth: '150px' }} />
              <button type="button" onClick={() => remove(i)} className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input className="form-input" placeholder="Source (e.g. GhanaWeb)" value={link.source} onChange={e => update(i, 'source', e.target.value)} style={{ flex: 1, minWidth: '120px' }} />
              <input type="date" className="form-input" value={link.date} onChange={e => update(i, 'date', e.target.value)} style={{ flex: '0 0 140px' }} />
              <input className="form-input" placeholder="URL" value={link.url} onChange={e => update(i, 'url', e.target.value)} style={{ flex: 3, minWidth: '180px' }} />
            </div>
          </div>
        ))}
        <button type="button" onClick={add} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>+ Add Media Link</button>
      </div>
    </div>
  );
}

function PhotosEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const add = () => onChange([...value, '']);
  const update = (i: number, v: string) => { const next = [...value]; next[i] = v; onChange(next); };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  return (
    <div>
      <div className="form-label">Photo URLs</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {value.map((url, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <input className="form-input" placeholder="https://example.com/photo.jpg" value={url} onChange={e => update(i, e.target.value)} style={{ flex: 1 }} />
            <button type="button" onClick={() => remove(i)} className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}>✕</button>
          </div>
        ))}
        <button type="button" onClick={add} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>+ Add Photo</button>
      </div>
    </div>
  );
}

function UpdatesEditor({ value, onChange }: { value: EntityUpdate[]; onChange: (v: EntityUpdate[]) => void }) {
  const add = () => onChange([{ date: new Date().toISOString().slice(0, 10), text: '' }, ...value]);
  const upd = (i: number, field: keyof EntityUpdate, v: string) => {
    const next = [...value]; next[i] = { ...next[i], [field]: v }; onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  return (
    <div>
      <div className="form-label">Updates / Timeline Entries</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {value.map((u, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <input type="date" className="form-input" value={u.date} onChange={e => upd(i, 'date', e.target.value)} style={{ flex: '0 0 140px' }} />
            <textarea className="form-textarea" rows={2} placeholder="Update text…" value={u.text} onChange={e => upd(i, 'text', e.target.value)} style={{ flex: 1, minHeight: '60px' }} />
            <button type="button" onClick={() => remove(i)} className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}>✕</button>
          </div>
        ))}
        <button type="button" onClick={add} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>+ Add Update</button>
      </div>
    </div>
  );
}

// ─── Policy Form ───────────────────────────────────────────────────────────────

function PolicyForm({ initial, tags, onSaved, onCancel }: {
  initial: Partial<Policy>;
  tags: Tag[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Policy>>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const upd = (k: keyof Policy, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title?.trim()) { setError('Title is required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (payload.id) {
        await supa('policies', 'PATCH', payload, payload.id);
      } else {
        await supa('policies', 'POST', payload);
      }
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{form.id ? 'Edit Policy' : 'New Policy'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onCancel} className="btn btn-ghost btn-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">
            {saving ? 'Saving…' : 'Save Policy'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Core fields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Title *</label>
          <input className="form-input" value={form.title ?? ''} onChange={e => upd('title', e.target.value)} placeholder="Policy title…" />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category ?? ''} onChange={e => upd('category', e.target.value)}>
            <option value="">Select…</option>
            {POLICY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={form.date ?? ''} onChange={e => upd('date', e.target.value || null)} />
        </div>
        <div className="form-group">
          <label className="form-label">Sponsor</label>
          <input className="form-input" value={form.sponsor ?? ''} onChange={e => upd('sponsor', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Party</label>
          <input className="form-input" value={form.party ?? ''} onChange={e => upd('party', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status ?? 'draft'} onChange={e => upd('status', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Outcome Status</label>
          <select className="form-select" value={form.outcome_status ?? 'pending'} onChange={e => upd('outcome_status', e.target.value)}>
            <option value="pending">Pending</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="form-group">
        <label className="form-label">Tags</label>
        <TagSelector value={form.tags ?? []} onChange={v => upd('tags', v)} allTags={tags} />
      </div>

      {/* Content */}
      {(['intro', 'background', 'keydetails', 'timeline', 'structure', 'outcome'] as const).map(field => (
        <div key={field} className="form-group">
          <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <textarea className="form-textarea" rows={4} value={(form as Record<string, unknown>)[field] as string ?? ''}
            onChange={e => upd(field, e.target.value)} />
        </div>
      ))}

      {/* Finance */}
      <FinanceEditor value={(form.finance ?? {}) as PolicyFinance} onChange={v => upd('finance', v)} />

      {/* Ratings */}
      <RatingInputGroup label="Pre-Implementation Ratings" value={(form.pre_ratings ?? {}) as RatingDimensions} onChange={v => upd('pre_ratings', v)} />
      <RatingInputGroup label="Post-Implementation Ratings" value={(form.post_ratings ?? {}) as RatingDimensions} onChange={v => upd('post_ratings', v)} />

      {/* Refs */}
      <RefsEditor value={form.refs ?? []} onChange={v => upd('refs', v)} />

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} className="btn btn-ghost btn-sm">Cancel</button>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving…' : form.id ? 'Update Policy' : 'Create Policy'}
        </button>
      </div>
    </div>
  );
}

// ─── Entity Form ───────────────────────────────────────────────────────────────

function EntityForm({ initial, tags, policies, onSaved, onCancel }: {
  initial: Partial<Entity>;
  tags: Tag[];
  policies: Policy[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Entity>>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const upd = (k: keyof Entity, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name?.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (payload.id) {
        await supa('entities', 'PATCH', payload, payload.id);
      } else {
        await supa('entities', 'POST', payload);
      }
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{form.id ? 'Edit Entity' : 'New Entity'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onCancel} className="btn btn-ghost btn-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Name *</label>
          <input className="form-input" value={form.name ?? ''} onChange={e => upd('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={form.type ?? 'official'} onChange={e => upd('type', e.target.value)}>
            <option value="official">Official</option>
            <option value="institution">Institution</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status ?? 'draft'} onChange={e => upd('status', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Role / Title</label>
          <input className="form-input" value={form.role ?? ''} onChange={e => upd('role', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Party</label>
          <input className="form-input" value={form.party ?? ''} onChange={e => upd('party', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Tenure</label>
          <input className="form-input" placeholder="e.g. Jan 2017 – Jan 2021" value={form.tenure ?? ''} onChange={e => upd('tenure', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Website</label>
          <input className="form-input" placeholder="https://…" value={form.website ?? ''} onChange={e => upd('website', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Budget Doc URL</label>
          <input className="form-input" placeholder="https://…" value={form.budget ?? ''} onChange={e => upd('budget', e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tags</label>
        <TagSelector value={form.tags ?? []} onChange={v => upd('tags', v)} allTags={tags} />
      </div>

      <PhotosEditor value={form.photos ?? []} onChange={v => upd('photos', v)} />

      {(['bio', 'background', 'timeline'] as const).map(field => (
        <div key={field} className="form-group">
          <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <textarea className="form-textarea" rows={4} value={(form as Record<string, unknown>)[field] as string ?? ''}
            onChange={e => upd(field, e.target.value)} />
        </div>
      ))}

      <UpdatesEditor value={form.updates ?? []} onChange={v => upd('updates', v)} />
      <MediaLinksEditor value={form.media_links ?? []} onChange={v => upd('media_links', v)} />

      {/* Linked policies */}
      <div className="form-group">
        <label className="form-label">Linked Policies</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '200px', overflowY: 'auto', padding: '0.25rem' }}>
          {policies.map(p => (
            <label key={p.id} className="form-checkbox">
              <input
                type="checkbox"
                checked={(form.linked_policies ?? []).includes(p.id)}
                onChange={e => {
                  const prev = form.linked_policies ?? [];
                  upd('linked_policies', e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id));
                }}
              />
              <span style={{ fontSize: '0.85rem' }}>{p.title}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} className="btn btn-ghost btn-sm">Cancel</button>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving…' : form.id ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
}

// ─── Tag Manager Tab ───────────────────────────────────────────────────────────

function TagManagerTab({ tags, onRefresh }: { tags: Tag[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<Partial<Tag> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const saveTag = async () => {
    if (!editing?.code?.trim() || !editing?.label?.trim()) { setError('Code and label required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...editing };
      if (payload.id) {
        await supa('tags', 'PATCH', payload, payload.id);
      } else {
        await supa('tags', 'POST', { ...payload, is_core: false });
      }
      setEditing(null);
      onRefresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally { setSaving(false); }
  };

  const deleteTag = async (tag: Tag) => {
    if (tag.is_core) { alert('Core tags cannot be deleted.'); return; }
    if (!confirm(`Delete tag "${tag.label}"?`)) return;
    try {
      await supa('tags', 'DELETE', undefined, tag.id);
      onRefresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tag Manager</h2>
        {!editing && (
          <button onClick={() => setEditing(blankTag())} className="btn btn-primary btn-sm">+ New Tag</button>
        )}
      </div>

      {editing && (
        <div className="card" style={{ border: '1px solid var(--accent-dim-2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{editing.id ? 'Edit Tag' : 'New Tag'}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Code (short)</label>
                <input className="form-input" placeholder="FRAUD" value={editing.code ?? ''} onChange={e => setEditing(ed => ({ ...ed!, code: e.target.value.toUpperCase().slice(0, 8) }))} disabled={!!editing.is_core} />
              </div>
              <div className="form-group">
                <label className="form-label">Display Label</label>
                <input className="form-input" placeholder="Fraud" value={editing.label ?? ''} onChange={e => setEditing(ed => ({ ...ed!, label: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input type="color" className="form-input" value={editing.color ?? '#6b7280'} onChange={e => setEditing(ed => ({ ...ed!, color: e.target.value }))} style={{ padding: '0.2rem', height: '44px', cursor: 'pointer' }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Brief description…" value={editing.description ?? ''} onChange={e => setEditing(ed => ({ ...ed!, description: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setEditing(null)} className="btn btn-ghost btn-sm">Cancel</button>
              <button onClick={saveTag} disabled={saving} className="btn btn-primary btn-sm">
                {saving ? 'Saving…' : 'Save Tag'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Core tags */}
      <div>
        <div className="form-label" style={{ marginBottom: '0.5rem' }}>Core Tags (locked)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {tags.filter(t => t.is_core).map(tag => (
            <span key={tag.id} style={{
              padding: '0.25em 0.65em', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
              fontFamily: 'var(--font-mono)', background: tag.color + '22', color: tag.color,
              border: `1px solid ${tag.color}44`,
            }} title={tag.description}>
              {tag.label} 🔒
            </span>
          ))}
        </div>
      </div>

      {/* Custom tags */}
      <div>
        <div className="form-label" style={{ marginBottom: '0.5rem' }}>Custom Tags</div>
        {tags.filter(t => !t.is_core).length === 0 ? (
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No custom tags yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tags.filter(t => !t.is_core).map(tag => (
              <div key={tag.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem', background: 'var(--bg-3)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: tag.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: tag.color, width: '80px' }}>{tag.code}</span>
                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text)' }}>{tag.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', flex: 2 }}>{tag.description}</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button onClick={() => setEditing(tag)} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.5rem' }}>Edit</button>
                  <button onClick={() => deleteTag(tag)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.5rem' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Draft Tab ──────────────────────────────────────────────────────────────

function AiDraftTab({ tags, onApplyDraft }: { tags: Tag[]; onApplyDraft: (p: Partial<Policy>) => void }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Partial<Policy> | null>(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const prompt = `You are a Ghanaian civic policy researcher for Public Profile, a Ghana accountability tracker.
The admin has provided this topic/headline: "${topic}"

Generate a complete policy draft as a JSON object with these fields:
- title: string
- category: one of ${POLICY_CATEGORIES.join(', ')}
- date: YYYY-MM-DD or null
- sponsor: person or ministry name
- party: NPP or NDC or empty string
- tags: array of tag codes from [${tags.map(t => t.code).join(', ')}]
- intro: 2-3 sentence overview (plain language for ordinary Ghanaians)
- background: 3-4 sentences of historical/political context
- keydetails: bullet points or paragraphs of key facts, structured with line breaks
- timeline: key dates and events, one per line with date prefix
- structure: how the policy/deal is structured (parties, terms, mechanism)
- outcome: current status and impact assessment
- outcome_status: "pending" | "positive" | "negative"
- refs: array of {label, url} with placeholder URLs if real ones unknown
- finance: object with fields: totalAmount, fundingSource (${FUNDING_SOURCES.join('/')}), fromPublicPurse (bool), donorName, loanTerms, disbursedAmount, notes

CRITICAL: Respond with ONLY valid JSON, no markdown, no explanation. All text must be accurate and sourced from your knowledge of Ghanaian politics and governance.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTH_KEY!,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? 'API error');

      const text = data.content?.[0]?.text ?? '';
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      const draft = JSON.parse(cleaned);
      setResult(draft);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed. Check your API key.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.375rem' }}>AI Policy Draft</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
          Describe a Ghanaian government policy or paste a headline. AI will generate a full draft for you to review and edit before publishing.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
        <textarea
          className="form-textarea"
          rows={3}
          placeholder="e.g. 'Ghana's $750m Atuabo Gas Plant deal with ENI' or 'Ken Ofori-Atta 2022 domestic debt exchange programme'"
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />
        <button onClick={generate} disabled={loading || !topic.trim() || !ANTH_KEY} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating…</> : '✨ Generate Draft'}
        </button>
        {!ANTH_KEY && <div className="alert alert-error">NEXT_PUBLIC_ANTHROPIC_KEY not set.</div>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="card" style={{ border: '1px solid var(--accent-dim-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div className="section-label" style={{ marginBottom: '0.25rem' }}>Draft Generated</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{result.title}</h3>
            </div>
            <button
              onClick={() => { onApplyDraft(result); setResult(null); }}
              className="btn btn-primary btn-sm"
            >
              Load into Policy Form →
            </button>
          </div>
          <pre style={{
            fontSize: '0.78rem', color: 'var(--text-3)', whiteSpace: 'pre-wrap',
            maxHeight: '300px', overflowY: 'auto', fontFamily: 'var(--font-mono)', lineHeight: 1.5,
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── AI Update Assist Tab ──────────────────────────────────────────────────────

function AiUpdateTab({ policies, entities }: { policies: Policy[]; entities: Entity[] }) {
  const [targetType, setTargetType] = useState<'policy' | 'entity'>('policy');
  const [targetId, setTargetId] = useState('');
  const [updateType, setUpdateType] = useState('Latest Developments');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const target = targetType === 'policy'
    ? policies.find(p => p.id === targetId)
    : entities.find(e => e.id === targetId);

  const generate = async () => {
    if (!target) return;
    setLoading(true); setError(''); setResult('');
    try {
      const contextStr = JSON.stringify(
        targetType === 'policy'
          ? { title: (target as Policy).title, intro: (target as Policy).intro, outcome: (target as Policy).outcome }
          : { name: (target as Entity).name, role: (target as Entity).role, bio: (target as Entity).bio },
        null, 2
      );

      const prompt = `You are a Ghanaian civic policy researcher.
Update type requested: "${updateType}"
Target: ${targetType === 'policy' ? 'Policy' : 'Entity'}
Current data:
${contextStr}

Generate a "${updateType}" update. Write 2-4 paragraphs of factual, plain-language text suitable for the "${updateType}" field on a Ghana accountability platform. Be specific, cite where possible, and keep it neutral and factual. Do not include any JSON formatting — just the plain text update.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTH_KEY!,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? 'API error');
      setResult(data.content?.[0]?.text ?? '');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.375rem' }}>AI Update Assist</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
          Select a policy or entity, choose an update type, and AI will draft the update text. Copy or apply it manually after review.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <div className="form-group">
          <label className="form-label">Target Type</label>
          <select className="form-select" value={targetType} onChange={e => { setTargetType(e.target.value as 'policy' | 'entity'); setTargetId(''); }}>
            <option value="policy">Policy</option>
            <option value="entity">Official/Institution</option>
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Select {targetType === 'policy' ? 'Policy' : 'Entity'}</label>
          <select className="form-select" value={targetId} onChange={e => setTargetId(e.target.value)}>
            <option value="">Select…</option>
            {(targetType === 'policy' ? policies : entities).map(item => (
              <option key={item.id} value={item.id}>
                {targetType === 'policy' ? (item as Policy).title : (item as Entity).name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Update Type</label>
          <select className="form-select" value={updateType} onChange={e => setUpdateType(e.target.value)}>
            {['Latest Developments', 'Timeline Update', 'Outcome Revision', 'Financial Update', 'Full Summary Refresh'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={generate} disabled={loading || !targetId || !ANTH_KEY} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
        {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating…</> : '✨ Generate Update'}
      </button>

      {!ANTH_KEY && <div className="alert alert-error">NEXT_PUBLIC_ANTHROPIC_KEY not set.</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="card" style={{ border: '1px solid var(--accent-dim-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div className="section-label" style={{ marginBottom: 0 }}>Generated Update — review before applying</div>
            <button
              onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="btn btn-secondary btn-sm"
            >
              {copied ? '✓ Copied' : 'Copy Text'}
            </button>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────

type Tab = 'policies' | 'entities' | 'tags' | 'ai-draft' | 'ai-update';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'policies', label: 'Policies', icon: '📋' },
  { id: 'entities', label: 'Officials', icon: '👤' },
  { id: 'tags', label: 'Tags', icon: '🏷️' },
  { id: 'ai-draft', label: 'AI Draft', icon: '✨' },
  { id: 'ai-update', label: 'AI Update', icon: '🔄' },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('policies');

  // Data
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Forms
  const [editingPolicy, setEditingPolicy] = useState<Partial<Policy> | null>(null);
  const [editingEntity, setEditingEntity] = useState<Partial<Entity> | null>(null);

  // Auth check
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === ADMIN_USER_ID) setAuthed(true);
      setChecking(false);
    })();
  }, []);

  // Load data
  const loadData = async () => {
    const [p, e, t] = await Promise.all([
      fetch(`${SUPA_URL}/rest/v1/policies?order=created_at.desc`, { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }).then(r => r.json()),
      fetch(`${SUPA_URL}/rest/v1/entities?order=name.asc`, { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }).then(r => r.json()),
      fetch(`${SUPA_URL}/rest/v1/tags?order=is_core.desc,label.asc`, { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }).then(r => r.json()),
    ]);
    setPolicies(Array.isArray(p) ? p : []);
    setEntities(Array.isArray(e) ? e : []);
    setTags(Array.isArray(t) ? t : []);
  };

  useEffect(() => { if (authed) loadData(); }, [authed]);

  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
  };

  const deletePolicy = async (id: string) => {
    if (!confirm('Delete this policy?')) return;
    await supa('policies', 'DELETE', undefined, id);
    loadData();
  };

  const deleteEntity = async (id: string) => {
    if (!confirm('Delete this entity?')) return;
    await supa('entities', 'DELETE', undefined, id);
    loadData();
  };

  if (checking) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span className="spinner" />
    </div>
  );

  if (!authed) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Admin Access Required</h1>
      <p style={{ color: 'var(--text-2)' }}>Sign in with the admin Google account to continue.</p>
      <button onClick={handleSignIn} className="btn btn-primary">Sign in with Google</button>
    </div>
  );

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        {TABS.map(({ id, label, icon }) => (
          <div
            key={id}
            className={`admin-nav-item ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ padding: '1.5rem', overflowY: 'auto' }}>

        {/* ── Policies ── */}
        {tab === 'policies' && (
          editingPolicy ? (
            <PolicyForm
              initial={editingPolicy}
              tags={tags}
              onSaved={() => { setEditingPolicy(null); loadData(); }}
              onCancel={() => setEditingPolicy(null)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Policies ({policies.length})</h2>
                <button onClick={() => setEditingPolicy(blankPolicy())} className="btn btn-primary btn-sm">+ New Policy</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {policies.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', background: 'var(--bg-3)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                    flexWrap: 'wrap',
                  }}>
                    <span className={`badge badge-${p.status}`} style={{ flexShrink: 0 }}>{p.status}</span>
                    <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, minWidth: '150px' }}>{p.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{p.category}</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                      <button onClick={() => setEditingPolicy(p)} className="btn btn-ghost btn-sm">Edit</button>
                      <a href={`/policies/${p.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">View</a>
                      <button onClick={() => deletePolicy(p.id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* ── Entities ── */}
        {tab === 'entities' && (
          editingEntity ? (
            <EntityForm
              initial={editingEntity}
              tags={tags}
              policies={policies}
              onSaved={() => { setEditingEntity(null); loadData(); }}
              onCancel={() => setEditingEntity(null)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Officials & Institutions ({entities.length})</h2>
                <button onClick={() => setEditingEntity(blankEntity())} className="btn btn-primary btn-sm">+ New Entity</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {entities.map(e => (
                  <div key={e.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', background: 'var(--bg-3)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                    flexWrap: 'wrap',
                  }}>
                    <span className={`badge badge-${e.status}`} style={{ flexShrink: 0 }}>{e.status}</span>
                    <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, minWidth: '120px' }}>{e.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{e.role}</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                      <button onClick={() => setEditingEntity(e)} className="btn btn-ghost btn-sm">Edit</button>
                      <a href={`/officials/${e.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">View</a>
                      <button onClick={() => deleteEntity(e.id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* ── Tags ── */}
        {tab === 'tags' && <TagManagerTab tags={tags} onRefresh={loadData} />}

        {/* ── AI Draft ── */}
        {tab === 'ai-draft' && (
          <AiDraftTab
            tags={tags}
            onApplyDraft={draft => {
              setEditingPolicy({ ...blankPolicy(), ...draft });
              setTab('policies');
            }}
          />
        )}

        {/* ── AI Update ── */}
        {tab === 'ai-update' && <AiUpdateTab policies={policies} entities={entities} />}
      </div>
    </div>
  );
}
