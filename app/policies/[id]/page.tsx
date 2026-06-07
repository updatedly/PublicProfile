import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPolicyById, getCommentsByPolicy, getRatingsByPolicy } from '@/lib/queries'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CommentForm from '@/components/CommentForm'
import RatingForm from '@/components/RatingForm'
import type { Policy, Comment, Rating } from '@/lib/types'

export const revalidate = 30

interface Props { params: Promise<{ id: string }> }

// ─── Helpers ────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function avgRatings(ratings: Rating[]) {
  if (!ratings.length) return null
  const keys = ['transparency','representation','justification','readiness','effectiveness','ux','equity','cost'] as const
  const avgs: Record<string, number | null> = {}
  keys.forEach(k => {
    const vals = ratings.map(r => ((r.ratings as unknown) as Record<string,number|null>)[k]).filter((v): v is number => v != null)
    avgs[k] = vals.length ? +(vals.reduce((a,b) => a+b,0) / vals.length).toFixed(1) : null
  })
  return { count: ratings.length, avgs }
}

// ─── Sub-components ─────────────────────────────────────────

function RatingCard({ label, desc, value }: { label: string; desc: string; value: number | null }) {
  const pct = value != null ? value * 10 : 0
  return (
    <div style={{ marginBottom: '.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}>
        <div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.52rem', color: 'var(--muted)', marginLeft: '.5rem' }}>{desc}</span>
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: value != null ? 'var(--gold)' : 'var(--muted2)', minWidth: '32px', textAlign: 'right' }}>
          {value != null ? `${value}/10` : '—'}
        </span>
      </div>
      <div className="rating-bar-track">
        <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function TimelineBlock({ raw }: { raw: string }) {
  const items = raw.split('\n').filter(Boolean).map(line => {
    const [date, ...rest] = line.split('|')
    return { date: date.trim(), text: rest.join('|').trim() }
  })
  if (!items.length) return <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>No timeline entries.</p>
  return (
    <div className="tl">
      {items.map((item, i) => (
        <div key={i} className="tl-item">
          <div className="tl-dot" />
          <div className="tl-date">{item.date}</div>
          <div className="tl-text">{item.text}</div>
        </div>
      ))}
    </div>
  )
}

function KeyDetailsBullets({ raw }: { raw: string }) {
  const lines = raw.split(/[.\n]/).map(s => s.trim()).filter(s => s.length > 8)
  if (lines.length <= 1) return <p className="ch-body" style={{ fontSize: '.9rem', lineHeight: 1.78, color: '#ccc6bc', fontWeight: 300 }}>{raw}</p>
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {lines.map((l, i) => (
        <li key={i} style={{ display: 'flex', gap: '.65rem', padding: '.35rem 0', borderBottom: '1px solid var(--border)', fontSize: '.875rem', lineHeight: 1.65, color: '#ccc6bc', fontWeight: 300 }}>
          <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '.12rem' }}>—</span>
          <span>{l.replace(/^[-·•]\s*/, '')}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── Page ───────────────────────────────────────────────────

export default async function PolicyPage({ params }: Props) {
  const { id } = await params
  const [policy, comments, ratings] = await Promise.all([
    getPolicyById(id),
    getCommentsByPolicy(id),
    getRatingsByPolicy(id),
  ])

  if (!policy) notFound()

  const p = policy as Policy
  const agg = avgRatings(ratings)

  const OUTCOME_LABELS: Record<string,string> = {
    positive: '✓ Positive', negative: '✗ Negative', pending: '◌ Pending',
  }

  const PRE_METRICS = [
    { key: 'transparency',   label: 'Transparency',   desc: 'Citizen-understandable?' },
    { key: 'representation', label: 'Representation', desc: 'Stakeholders consulted?' },
    { key: 'justification',  label: 'Justification',  desc: 'Real issue addressed?' },
    { key: 'readiness',      label: 'Prudence',        desc: 'Trust in execution?' },
  ]
  const POST_METRICS = [
    { key: 'effectiveness',  label: 'Effectiveness',  desc: 'Problem solved?' },
    { key: 'ux',             label: 'User Experience', desc: 'Accessible to citizens?' },
    { key: 'equity',         label: 'Equity',          desc: 'Benefits distributed fairly?' },
    { key: 'cost',           label: 'Cost-Efficiency', desc: 'Good use of funds?' },
  ]

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0' }}>

        {/* Back */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)' }}>
          <Link href="/" style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            ← Back to Tracker
          </Link>
        </div>

        {/* Detail layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0 }}>

          {/* ── LEFT: main content ── */}
          <div style={{ borderRight: '1px solid var(--border)' }}>

            {/* Header block */}
            <div style={{ padding: '2rem 1.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', marginBottom: '.6rem' }}>
                {p.category}
              </div>
              <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1rem' }}>
                {p.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'center', paddingTop: '.85rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--muted2)' }}>Sponsor</span>{' '}
                  <strong style={{ color: 'var(--text)' }}>{p.sponsor}</strong>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--muted2)' }}>Date</span>{' '}
                  <strong style={{ color: 'var(--text)' }}>{fmtDate(p.date)}</strong>
                </div>
                {p.party && <span className={`tag tag-${p.party}`}>{p.party}</span>}
                <span className={`outcome-badge ${p.outcome_status}`}>{OUTCOME_LABELS[p.outcome_status] ?? '—'}</span>
                <div style={{ display: 'flex', gap: '.35rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                  {p.tags.map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
                </div>
              </div>
            </div>

            {/* 6 chapters */}
            <div style={{ padding: '0 1.75rem' }}>
              {[
                { n: '01', t: 'Introduction',            content: p.intro,       type: 'text' },
                { n: '02', t: 'Background',              content: p.background,  type: 'text' },
                { n: '03', t: 'Key Details',             content: p.keydetails,  type: 'bullets' },
                { n: '04', t: 'Timeline',                content: p.timeline,    type: 'timeline' },
                { n: '05', t: 'Cost Structure & Finance',content: p.structure,   type: 'text' },
                { n: '06', t: 'Outcome',                 content: p.outcome,     type: 'text' },
              ].map(ch => (
                <div key={ch.n} className="chapter">
                  <div className="ch-num">Chapter {ch.n}</div>
                  <div className="ch-title">{ch.t}</div>
                  <div className="ch-body">
                    {ch.type === 'timeline' && <TimelineBlock raw={ch.content} />}
                    {ch.type === 'bullets'  && <KeyDetailsBullets raw={ch.content} />}
                    {ch.type === 'text'     && ch.content.split('\n').filter(Boolean).map((l, i) => <p key={i}>{l}</p>)}
                  </div>
                </div>
              ))}

              {/* References */}
              {p.refs?.length > 0 && (
                <div className="chapter">
                  <div className="ch-num">Sources</div>
                  <div className="ch-title">References &amp; Documents</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {p.refs.map((ref, i) => (
                      <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.6rem .85rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--gold)', textDecoration: 'none', fontFamily: 'var(--mono)', fontSize: '.65rem' }}>
                        <span style={{ opacity: .5 }}>↗</span> {ref.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div style={{ padding: '1.5rem 1.75rem 2rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.56rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                Public Comments ({comments.length})
              </div>

              {comments.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '.82rem', fontWeight: 300 }}>No comments yet. Be the first.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5px', marginBottom: '1.5rem' }}>
                  {comments.map(c => (
                    <div key={c.id} style={{ padding: '.9rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', fontWeight: 600, color: 'var(--text)' }}>{c.user_name}</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '.54rem', color: 'var(--muted2)' }}>{fmtDate(c.created_at)}</span>
                      </div>
                      <p style={{ fontSize: '.84rem', lineHeight: 1.6, color: '#ccc6bc', fontWeight: 300 }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}

              <CommentForm policyId={p.id} />
            </div>
          </div>

          {/* ── RIGHT: sidebar ── */}
          <div style={{ padding: '1.5rem 1.25rem' }}>

            {/* Admin admin ratings */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem', marginBottom: '.75rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '.85rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border)' }}>
                Pre-Written Metrics <span style={{ color: 'var(--muted2)', fontWeight: 300 }}>· Design &amp; Intent</span>
              </div>
              {PRE_METRICS.map(m => (
                <RatingCard key={m.key} label={m.label} desc={m.desc}
                  value={((p.pre_ratings as unknown) as Record<string,number|null>)?.[m.key] ?? null} />
              ))}
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', margin: '1rem 0 .85rem', paddingTop: '.75rem', borderTop: '1px solid var(--border)' }}>
                Post-Written Metrics <span style={{ color: 'var(--muted2)', fontWeight: 300 }}>· Execution &amp; Reality</span>
              </div>
              {POST_METRICS.map(m => (
                <RatingCard key={m.key} label={m.label} desc={m.desc}
                  value={((p.post_ratings as unknown) as Record<string,number|null>)?.[m.key] ?? null} />
              ))}
            </div>

            {/* Community ratings summary */}
            {agg && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem', marginBottom: '.75rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Community Ratings</span>
                  <span style={{ color: 'var(--gold)' }}>{agg.count} voter{agg.count !== 1 ? 's' : ''}</span>
                </div>
                {[...PRE_METRICS, ...POST_METRICS].map(m => (
                  <RatingCard key={m.key} label={m.label} desc="" value={agg.avgs[m.key] ?? null} />
                ))}
              </div>
            )}

            {/* Finance block */}
            {p.finance?.totalAmount && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem', marginBottom: '.75rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '.75rem' }}>
                  Finance
                </div>
                <div className="finance-amount-label">Total Amount</div>
                <div className="finance-amount">{p.finance.totalAmount}</div>
                {p.finance.source && (
                  <div className="finance-row" style={{ marginTop: '.75rem' }}>
                    <span className="finance-row-label">Source</span>
                    <span className="finance-row-value">{p.finance.source}</span>
                  </div>
                )}
                {p.finance.donor && (
                  <div className="finance-row">
                    <span className="finance-row-label">Donor</span>
                    <span className="finance-row-value">{p.finance.donor}</span>
                  </div>
                )}
                {p.finance.budgetUrl && (
                  <a href={p.finance.budgetUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.75rem', padding: '.6rem .75rem', background: 'var(--gold-bg)', border: '1px solid rgba(201,168,76,.25)', color: 'var(--gold)', textDecoration: 'none', fontFamily: 'var(--mono)', fontSize: '.58rem' }}>
                    ↗ {p.finance.budgetLabel || 'Budget Document'}
                  </a>
                )}
              </div>
            )}

            {/* Rating form */}
            <RatingForm policyId={p.id} />

            {/* Tags */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '.65rem' }}>Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                {p.tags.map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media(max-width:768px){
          main > div { grid-template-columns: 1fr !important; }
          main > div > div:last-child { border-right: none !important; order: -1; }
        }
      `}</style>
    </>
  )
}
