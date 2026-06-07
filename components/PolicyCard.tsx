import Link from 'next/link'
import type { Policy } from '@/lib/types'

interface Props { policy: Policy }

const OUTCOME_LABELS: Record<string, string> = {
  positive: '✓ Positive',
  negative: '✗ Negative',
  pending:  '◌ Pending',
}

function readingTime(p: Policy): number {
  const words = [p.intro, p.background, p.keydetails, p.outcome]
    .filter(Boolean).join(' ').split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export default function PolicyCard({ policy: p }: Props) {
  const preVals = [
    p.pre_ratings?.transparency,
    p.pre_ratings?.representation,
    p.pre_ratings?.justification,
    p.pre_ratings?.readiness,
  ]

  return (
    <Link href={`/policies/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article className="policy-card fade-up">
        {/* Eyebrow */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.55rem' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.54rem', textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)' }}>
            {p.category}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.54rem', color: 'var(--muted2)' }}>
            {p.date?.slice(0, 4)}
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '.5rem', lineHeight: 1.25 }}>
          {p.title}
        </h2>

        {/* Intro */}
        <p style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.55, marginBottom: '.85rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.intro}
        </p>

        {/* Mini rating bars */}
        <div style={{ display: 'flex', gap: '.3rem', marginBottom: '.75rem' }}>
          {preVals.map((v, i) => (
            <div key={i} className="mini-bar">
              <div className="mini-bar-fill" style={{ width: `${(v ?? 0) * 10}%` }} />
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginBottom: '.85rem' }}>
          {p.tags.map(t => (
            <span key={t} className={`tag tag-${t}`}>{t}</span>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '.65rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '.56rem', color: 'var(--muted)' }}>
            By <strong style={{ color: 'var(--text)' }}>{p.sponsor}</strong>
            {p.party && <span className={`tag tag-${p.party}`} style={{ fontSize: '.48rem', padding: '.1rem .3rem', marginLeft: '.4rem' }}>{p.party}</span>}
          </div>
          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
            <span className={`outcome-badge ${p.outcome_status}`}>{OUTCOME_LABELS[p.outcome_status] ?? '—'}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '.52rem', color: 'var(--muted2)' }}>
              {readingTime(p)}m read
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
