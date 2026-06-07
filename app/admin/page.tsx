'use client'


import { useState, useEffect, useTransition, useRef } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import {
  createPolicy, updatePolicy, deletePolicy, publishPolicy, archivePolicy,
  createEntity, updateEntity, deleteEntity,
} from '@/lib/actions'
import type { Policy, Entity } from '@/lib/types'

type Tab = 'hub' | 'entities' | 'new-policy' | 'new-entity'

const CATEGORIES = [
  'Economic Policy','Governance Reform','Energy Policy','Health Policy',
  'Infrastructure','Education Policy','Security & Defence','Trade & Commerce',
  'Political Decision','Other',
]
const ALL_TAGS = ['NPP','NDC','PEP','COMP','CORR','ADM','REPU','CONT','NCOM']

// ─── Inline styles helpers ───────────────────────────────────
const card   = { background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem', marginBottom: '.75rem' }
const sHead  = { fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '.85rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border)' }

// ─── Main component ──────────────────────────────────────────
export default function AdminPage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab]             = useState<Tab>('hub')
  const [policies, setPolicies]   = useState<Policy[]>([])
  const [entities, setEntities]   = useState<Entity[]>([])
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null)
  const [editEntity, setEditEntity] = useState<Entity | null>(null)
  const [hubFilter, setHubFilter] = useState('all')
  const [loading, setLoading]     = useState(true)
  const [message, setMessage]     = useState<{ type:'ok'|'err'; text:string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setChecking(false)
    })
  }, [])

  useEffect(() => {
    if (!checking && user?.id === adminId) loadAll()
  }, [checking, user?.id, adminId])

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
      Checking access…
    </div>
  )

  if (!user || user.id !== adminId) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '.5rem' }}>Admin Access</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '.65rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>You must be signed in as admin to view this page.</div>
        <button className="btn-primary" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } })}>
          Sign in with Google
        </button>
      </div>
    </div>
  )

  async function loadAll() {
    setLoading(true)
    const [{ data: pols }, { data: ents }] = await Promise.all([
      supabase.from('policies').select('*').order('created_at', { ascending: false }),
      supabase.from('entities').select('*').order('name', { ascending: true }),
    ])
    setPolicies((pols as Policy[]) ?? [])
    setEntities((ents as Entity[]) ?? [])
    setLoading(false)
  }

  function flash(type: 'ok'|'err', text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  // ── Policy actions ───────────────────────────────────────
  async function handleDeletePolicy(id: string) {
    if (!confirm('Delete this policy permanently?')) return
    startTransition(async () => {
      const r = await deletePolicy(id)
      if (r.error) flash('err', r.error)
      else { flash('ok', 'Policy deleted.'); loadAll() }
    })
  }
  async function handlePublish(id: string) {
    startTransition(async () => { await publishPolicy(id); loadAll() })
  }
  async function handleArchive(id: string) {
    startTransition(async () => { await archivePolicy(id); loadAll() })
  }

  // ── Entity actions ───────────────────────────────────────
  async function handleDeleteEntity(id: string) {
    if (!confirm('Delete this entity permanently?')) return
    startTransition(async () => {
      const r = await deleteEntity(id)
      if (r.error) flash('err', r.error)
      else { flash('ok', 'Entity deleted.'); loadAll() }
    })
  }

  const filteredPolicies = policies.filter(p =>
    hubFilter === 'all' ? true :
    hubFilter === 'published' ? p.status === 'published' :
    hubFilter === 'draft'     ? p.status === 'draft'     :
    p.status === 'archived'
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Admin header */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '0 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,15,15,.96)', backdropFilter: 'blur(10px)' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', fontWeight: 900 }}>
          Public <span style={{ color: 'var(--gold)' }}>Profile</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', color: 'var(--muted)', marginLeft: '.75rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>Admin</span>
        </div>
        <Link href="/" style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          ← Public Site
        </Link>
      </header>

      {/* Flash message */}
      {message && (
        <div className={`status-box ${message.type}`} style={{ margin: '1rem 1.75rem 0', borderRadius: 'var(--radius)' }}>
          {message.type === 'ok' ? '✓' : '✗'} {message.text}
        </div>
      )}

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>

        {/* Sidebar nav */}
        <nav style={{ width: '220px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '1.5rem 0' }}>
          {([
            { id:'hub',        label:'📋 Master Hub' },
            { id:'entities',   label:'🏛 Officials & Inst.' },
            { id:'new-policy', label:'✍ New Policy' },
            { id:'new-entity', label:'➕ New Official/Inst.' },
          ] as { id:Tab; label:string }[]).map(({ id, label }) => (
            <button key={id} onClick={() => { setTab(id); setEditPolicy(null); setEditEntity(null) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '.7rem 1.5rem',
                fontFamily: 'var(--mono)', fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.07em',
                background: tab === id ? 'var(--gold-bg)' : 'none',
                borderLeft: tab === id ? '2px solid var(--gold)' : '2px solid transparent',
                color: tab === id ? 'var(--gold)' : 'var(--muted)',
                border: 'none',
                cursor: 'pointer', transition: 'all .15s',
              }}>
              {label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <div style={{ flex: 1, padding: '1.75rem', overflowY: 'auto' }}>

          {/* ── POLICIES HUB ── */}
          {tab === 'hub' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 700 }}>Master Hub</h2>
                <button className="btn-primary btn-sm" onClick={() => { setTab('new-policy'); setEditPolicy(null) }}>+ New Policy</button>
              </div>

              {/* Hub filters */}
              <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {['all','published','draft','archived'].map(f => (
                  <button key={f} onClick={() => setHubFilter(f)}
                    style={{ fontFamily: 'var(--mono)', fontSize: '.54rem', textTransform: 'uppercase', letterSpacing: '.06em', padding: '.22rem .6rem', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', cursor: 'pointer', background: hubFilter===f ? 'var(--gold)' : 'none', color: hubFilter===f ? '#0f0f0f' : 'var(--muted)', transition: 'all .15s' }}>
                    {f} ({f==='all'?policies.length:policies.filter(p=>p.status===f).length})
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ textAlign:'center', padding:'3rem', fontFamily:'var(--mono)', fontSize:'.7rem', color:'var(--muted)' }}><span className="spinner" /></div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: '.7rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                        <th style={{ padding: '.6rem .75rem', textAlign: 'left', fontWeight: 400 }}>Title</th>
                        <th style={{ padding: '.6rem .75rem', textAlign: 'left', fontWeight: 400 }}>Year</th>
                        <th style={{ padding: '.6rem .75rem', textAlign: 'left', fontWeight: 400 }}>Status</th>
                        <th style={{ padding: '.6rem .75rem', textAlign: 'left', fontWeight: 400 }}>Likes</th>
                        <th style={{ padding: '.6rem .75rem', textAlign: 'left', fontWeight: 400 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPolicies.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '.7rem .75rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '.15rem', fontFamily: 'var(--serif)', fontSize: '.82rem' }}>{p.title}</div>
                            <div style={{ fontSize: '.58rem', color: 'var(--muted2)' }}>{p.category} · {p.date?.slice(0,4)}</div>
                          </td>
                          <td style={{ padding: '.7rem .75rem', color: 'var(--muted)' }}>{p.date?.slice(0,4)}</td>
                          <td style={{ padding: '.7rem .75rem' }}><span className={`status-pill ${p.status}`}>{p.status}</span></td>
                          <td style={{ padding: '.7rem .75rem', color: 'var(--muted)', textAlign: 'center' }}>{p.likes}</td>
                          <td style={{ padding: '.7rem .75rem' }}>
                            <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                              <button className="btn-ghost btn-sm" onClick={() => { setEditPolicy(p); setTab('new-policy') }}>Edit</button>
                              {p.status === 'published'
                                ? <button className="btn-ghost btn-sm" onClick={() => handleArchive(p.id)}>Archive</button>
                                : p.status === 'draft'
                                ? <button className="btn-primary btn-sm" onClick={() => handlePublish(p.id)}>Publish</button>
                                : <button className="btn-ghost btn-sm" onClick={() => handlePublish(p.id)}>Restore</button>
                              }
                              <button className="btn-danger btn-sm" onClick={() => handleDeletePolicy(p.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPolicies.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: '.7rem' }}>No policies found.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── ENTITIES HUB ── */}
          {tab === 'entities' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 700 }}>Officials &amp; Institutions</h2>
                <button className="btn-primary btn-sm" onClick={() => { setTab('new-entity'); setEditEntity(null) }}>+ New</button>
              </div>
              {loading ? (
                <div style={{ textAlign:'center', padding:'3rem' }}><span className="spinner" /></div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: '.7rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                        <th style={{ padding: '.6rem .75rem', textAlign: 'left', fontWeight: 400 }}>Name</th>
                        <th style={{ padding: '.6rem .75rem', textAlign: 'left', fontWeight: 400 }}>Type</th>
                        <th style={{ padding: '.6rem .75rem', textAlign: 'left', fontWeight: 400 }}>Status</th>
                        <th style={{ padding: '.6rem .75rem', textAlign: 'left', fontWeight: 400 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entities.map(e => (
                        <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '.7rem .75rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--serif)', fontSize: '.82rem' }}>{e.name}</div>
                            <div style={{ fontSize: '.58rem', color: 'var(--muted2)' }}>{e.role}</div>
                          </td>
                          <td style={{ padding: '.7rem .75rem', color: 'var(--muted)' }}>{e.type}</td>
                          <td style={{ padding: '.7rem .75rem' }}><span className={`status-pill ${e.status}`}>{e.status}</span></td>
                          <td style={{ padding: '.7rem .75rem' }}>
                            <div style={{ display: 'flex', gap: '.35rem' }}>
                              <button className="btn-ghost btn-sm" onClick={() => { setEditEntity(e); setTab('new-entity') }}>Edit</button>
                              <Link href={`/officials/${e.id}`} target="_blank">
                                <button className="btn-ghost btn-sm">View ↗</button>
                              </Link>
                              <button className="btn-danger btn-sm" onClick={() => handleDeleteEntity(e.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── NEW / EDIT POLICY FORM ── */}
          {tab === 'new-policy' && (
            <PolicyForm
              policy={editPolicy}
              onSaved={() => { loadAll(); setTab('hub'); setEditPolicy(null); flash('ok', editPolicy ? 'Policy updated.' : 'Policy created.') }}
              onError={(e) => flash('err', e)}
              isPending={isPending}
              startTransition={startTransition}
            />
          )}

          {/* ── NEW / EDIT ENTITY FORM ── */}
          {tab === 'new-entity' && (
            <EntityForm
              entity={editEntity}
              onSaved={() => { loadAll(); setTab('entities'); setEditEntity(null); flash('ok', editEntity ? 'Entity updated.' : 'Entity created.') }}
              onError={(e) => flash('err', e)}
              isPending={isPending}
              startTransition={startTransition}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Policy Form ─────────────────────────────────────────────

function PolicyForm({ policy: p, onSaved, onError, isPending, startTransition }: {
  policy: Policy | null
  onSaved: () => void
  onError: (e: string) => void
  isPending: boolean
  startTransition: (fn: () => void) => void
}) {
  const formRef  = useRef<HTMLFormElement>(null)
  const [tags, setTags] = useState<string[]>(p?.tags ?? [])

  function toggleTag(t: string) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function handleSubmit(status: 'draft' | 'published') {
    if (!formRef.current) return
    const fd = new FormData(formRef.current)
    fd.set('tags', tags.join(','))
    fd.set('status', status)

    startTransition(async () => {
      const result = p
        ? await updatePolicy(p.id, fd)
        : await createPolicy(fd)
      if (result?.error) onError(result.error)
      else onSaved()
    })
  }

  const field = (id: string, label: string, def?: string | null) => (
    <div style={{ marginBottom: '.85rem' }}>
      <label className="field-label">{label}</label>
      <input name={id} className="field-input" defaultValue={def ?? ''} />
    </div>
  )
  const textarea = (id: string, label: string, rows: number, def?: string | null) => (
    <div style={{ marginBottom: '.85rem' }}>
      <label className="field-label">{label}</label>
      <textarea name={id} className="field-input" rows={rows} style={{ resize: 'vertical' }} defaultValue={def ?? ''} />
    </div>
  )
  const rating = (id: string, label: string, def?: number | null) => (
    <div style={{ marginBottom: '.65rem' }}>
      <label className="field-label">{label} (0–10)</label>
      <input name={id} type="number" min="0" max="10" step="0.5" className="field-input" defaultValue={def ?? ''} />
    </div>
  )

  return (
    <div style={{ maxWidth: '680px' }}>
      <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        {p ? `Edit — ${p.title.slice(0, 40)}…` : 'New Policy'}
      </h2>

      <form ref={formRef}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          {field('title',    '1. Title *', p?.title)}
          {field('category', '2. Category', p?.category)}
          {field('date',     '3. Date (YYYY-MM-DD)', p?.date)}
          {field('sponsor',  '4. Sponsor / Author', p?.sponsor)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          <div style={{ marginBottom: '.85rem' }}>
            <label className="field-label">Party</label>
            <select name="party" className="field-input" defaultValue={p?.party ?? ''}>
              <option value="">— None —</option>
              <option value="NPP">NPP</option>
              <option value="NDC">NDC</option>
              <option value="GOV">Government</option>
            </select>
          </div>
          <div style={{ marginBottom: '.85rem' }}>
            <label className="field-label">Outcome Status</label>
            <select name="outcome_status" className="field-input" defaultValue={p?.outcome_status ?? 'pending'}>
              <option value="pending">◌ Pending</option>
              <option value="positive">✓ Positive</option>
              <option value="negative">✗ Negative</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '.85rem' }}>
          <label className="field-label">Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
            {ALL_TAGS.map(t => (
              <button key={t} type="button" onClick={() => toggleTag(t)}
                className={`tag tag-${t}`}
                style={{ cursor: 'pointer', opacity: tags.includes(t) ? 1 : 0.35, border: tags.includes(t) ? '2px solid var(--gold)' : undefined }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Chapters */}
        <div style={{ marginTop: '1rem', marginBottom: '1rem', fontFamily: 'var(--mono)', fontSize: '.56rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--gold)', paddingTop: '.75rem', borderTop: '1px solid var(--border)' }}>
          Content Chapters
        </div>
        {textarea('intro',      '1 · Introduction', 3, p?.intro)}
        {textarea('background', '2 · Background', 3, p?.background)}
        {textarea('keydetails', '3 · Key Details (separate points with periods)', 4, p?.keydetails)}
        {textarea('timeline',   '4 · Timeline (YYYY-MM-DD | Event, one per line)', 5, p?.timeline)}
        {textarea('structure',  '5 · Cost Structure & Finance', 3, p?.structure)}

        <div style={{ marginTop: '1rem', marginBottom: '1rem', fontFamily: 'var(--mono)', fontSize: '.56rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--gold)', paddingTop: '.75rem', borderTop: '1px solid var(--border)' }}>
          Finance Breakdown
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          {field('finance_totalAmount', 'Total Amount', p?.finance?.totalAmount)}
          <div style={{ marginBottom: '.85rem' }}>
            <label className="field-label">Funding Source Type</label>
            <select name="finance_source" className="field-input" defaultValue={p?.finance?.source ?? ''}>
              <option value="">- Not specified -</option>
              <option value="Public purse">Public purse</option>
              <option value="External">External</option>
              <option value="Donor">Donor</option>
              <option value="Grant">Grant</option>
              <option value="Loan">Loan</option>
              <option value="PPP">PPP</option>
            </select>
          </div>
          {field('finance_sourceDetail', 'Source Detail', p?.finance?.sourceDetail)}
          {field('finance_donor', 'Donor / Partner Name', p?.finance?.donor)}
          {field('finance_disbursed', 'Amount Disbursed', p?.finance?.disbursed)}
          {field('finance_budgetLabel', 'Budget Document Label', p?.finance?.budgetLabel)}
        </div>
        {textarea('finance_loan', 'Loan Terms', 2, p?.finance?.loan)}
        {textarea('finance_grant', 'Grant Details', 2, p?.finance?.grant)}
        {textarea('finance_partnership', 'PPP / Partnership Notes', 2, p?.finance?.partnership)}
        {textarea('finance_notes', 'Finance Notes', 2, p?.finance?.notes)}
        {field('finance_budgetUrl', 'Budget Document URL', p?.finance?.budgetUrl)}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '.85rem' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontFamily: 'var(--mono)', fontSize: '.62rem', color: 'var(--muted)' }}>
            <input name="finance_fromPublicPurse" type="checkbox" defaultChecked={Boolean(p?.finance?.fromPublicPurse)} />
            Uses public funds
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontFamily: 'var(--mono)', fontSize: '.62rem', color: 'var(--muted)' }}>
            <input name="finance_budgetPublic" type="checkbox" defaultChecked={Boolean(p?.finance?.budgetPublic)} />
            Public budget document exists
          </label>
        </div>

        {textarea('outcome',    '6 · Outcome', 3, p?.outcome)}

        {/* Pre-ratings */}
        <div style={{ marginTop: '1rem', fontFamily: 'var(--mono)', fontSize: '.56rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--gold)', paddingTop: '.75rem', borderTop: '1px solid var(--border)', marginBottom: '.75rem' }}>
          Pre-Written Metrics — Design &amp; Intent (Admin · 0–10)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          {rating('r_transparency',   'Transparency',   p?.pre_ratings?.transparency)}
          {rating('r_representation', 'Representation', p?.pre_ratings?.representation)}
          {rating('r_justification',  'Justification',  p?.pre_ratings?.justification)}
          {rating('r_readiness',      'Prudence',       p?.pre_ratings?.readiness)}
        </div>
        <div style={{ marginTop: '1rem', fontFamily: 'var(--mono)', fontSize: '.56rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--green)', paddingTop: '.75rem', borderTop: '1px solid var(--border)', marginBottom: '.75rem' }}>
          Post-Written Metrics — Execution &amp; Reality (Admin · 0–10)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          {rating('r_effectiveness', 'Effectiveness',  p?.post_ratings?.effectiveness)}
          {rating('r_ux',            'User Experience', p?.post_ratings?.ux)}
          {rating('r_equity',        'Equity',          p?.post_ratings?.equity)}
          {rating('r_cost',          'Cost-Efficiency', p?.post_ratings?.cost)}
        </div>
      </form>

      <div style={{ display: 'flex', gap: '.65rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn-ghost" onClick={() => handleSubmit('draft')} disabled={isPending}>
          {isPending ? <span className="spinner" /> : null} Save as Draft
        </button>
        <button className="btn-primary" onClick={() => handleSubmit('published')} disabled={isPending}>
          {isPending ? <span className="spinner" /> : null} {p ? 'Update & Publish' : 'Publish Now'}
        </button>
      </div>
    </div>
  )
}

// ─── Entity Form ─────────────────────────────────────────────

function EntityForm({ entity: e, onSaved, onError, isPending, startTransition }: {
  entity: Entity | null
  onSaved: () => void
  onError: (e: string) => void
  isPending: boolean
  startTransition: (fn: () => void) => void
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [tags, setTags] = useState<string[]>(e?.tags ?? [])
  function toggleTag(t: string) { setTags(prev => prev.includes(t) ? prev.filter(x=>x!==t):[...prev,t]) }

  function handleSubmit(status: string) {
    if (!formRef.current) return
    const fd = new FormData(formRef.current)
    fd.set('tags', tags.join(','))
    fd.set('status', status)
    startTransition(async () => {
      const result = e ? await updateEntity(e.id, fd) : await createEntity(fd)
      if (result?.error) onError(result.error)
      else onSaved()
    })
  }

  const field = (id: string, label: string, def?: string | null) => (
    <div style={{ marginBottom: '.85rem' }}>
      <label className="field-label">{label}</label>
      <input name={id} className="field-input" defaultValue={def ?? ''} />
    </div>
  )
  const textarea = (id: string, label: string, rows: number, def?: string | null) => (
    <div style={{ marginBottom: '.85rem' }}>
      <label className="field-label">{label}</label>
      <textarea name={id} className="field-input" rows={rows} style={{ resize: 'vertical' }} defaultValue={def ?? ''} />
    </div>
  )

  return (
    <div style={{ maxWidth: '680px' }}>
      <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        {e ? `Edit — ${e.name}` : 'New Official or Institution'}
      </h2>
      <form ref={formRef}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          {field('name',   'Full Name / Institution Name *', e?.name)}
          <div style={{ marginBottom: '.85rem' }}>
            <label className="field-label">Type</label>
            <select name="type" className="field-input" defaultValue={e?.type ?? 'official'}>
              <option value="official">Official (Person)</option>
              <option value="institution">Institution / Ministry</option>
            </select>
          </div>
          {field('role',   'Role / Title', e?.role)}
          <div style={{ marginBottom: '.85rem' }}>
            <label className="field-label">Party / Affiliation</label>
            <select name="party" className="field-input" defaultValue={e?.party ?? 'GOV'}>
              <option value="NPP">NPP</option>
              <option value="NDC">NDC</option>
              <option value="GOV">Non-Partisan / Government</option>
            </select>
          </div>
          {field('tenure',  'Tenure / Period', e?.tenure)}
          {field('website', 'Official Website', e?.website)}
        </div>

        <div style={{ marginBottom: '.85rem' }}>
          <label className="field-label">Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
            {ALL_TAGS.map(t => (
              <button key={t} type="button" onClick={() => toggleTag(t)}
                className={`tag tag-${t}`}
                style={{ cursor: 'pointer', opacity: tags.includes(t) ? 1 : 0.35, border: tags.includes(t) ? '2px solid var(--gold)' : undefined }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {textarea('bio',        'Overview / Bio', 4, e?.bio)}
        {textarea('background', 'Background & History', 3, e?.background)}
        {textarea('timeline',   'Timeline (YYYY-MM-DD | Event, one per line)', 5, e?.timeline)}
        <div style={{ marginBottom: '.85rem' }}>
          <label className="field-label">Photos (one URL per line)</label>
          <textarea name="photos" className="field-input" rows={3} style={{ resize: 'vertical' }} defaultValue={(e?.photos ?? []).join('\n')} placeholder="https://example.com/photo.jpg" />
        </div>
        <div style={{ marginBottom: '.85rem' }}>
          <label className="field-label">Media Links (type | title | source | date | url)</label>
          <textarea
            name="media_links"
            className="field-input"
            rows={4}
            style={{ resize: 'vertical' }}
            defaultValue={(e?.media_links ?? []).map(m => `${m.type} | ${m.title} | ${m.source} | ${m.date ?? ''} | ${m.url}`).join('\n')}
            placeholder="article | Headline | Source | 2026-01-01 | https://example.com/story"
          />
        </div>
        {field('budget',  'Budget / Resources', e?.budget)}
      </form>

      <div style={{ display: 'flex', gap: '.65rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn-ghost" onClick={() => handleSubmit('draft')} disabled={isPending}>Save as Draft</button>
        <button className="btn-primary" onClick={() => handleSubmit('published')} disabled={isPending}>
          {isPending ? <><span className="spinner" /> Saving…</> : (e ? 'Update & Publish' : 'Publish Now')}
        </button>
      </div>
    </div>
  )
}
