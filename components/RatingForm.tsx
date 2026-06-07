'use client'

import { useActionState, useState } from 'react'
import { submitRating } from '@/lib/actions'

interface Props { policyId: string; userRating?: Record<string, number | null> }

const PRE_METRICS  = [
  { key: 'transparency',   label: 'Transparency',   desc: 'Is it easy for the average citizen to understand?' },
  { key: 'representation', label: 'Representation', desc: 'Were key stakeholders actively consulted?' },
  { key: 'justification',  label: 'Justification',  desc: 'Does it address a real, verified national issue?' },
  { key: 'readiness',      label: 'Prudence',        desc: 'Trust in execution without waste or failure?' },
]
const POST_METRICS = [
  { key: 'effectiveness',  label: 'Effectiveness',  desc: 'Did it actually solve the targeted problem?' },
  { key: 'ux',             label: 'User Experience', desc: 'How accessible is it for citizens?' },
  { key: 'equity',         label: 'Equity',          desc: 'Did benefits reach everyone fairly?' },
  { key: 'cost',           label: 'Cost-Efficiency', desc: 'Was it a good use of public funds?' },
]

const initialState: { error: string; success: boolean } = { error: '', success: false }

export default function RatingForm({ policyId }: Props) {
  const [stars, setStars] = useState<Record<string, number>>({})
  const [email, setEmail] = useState('')

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string; success: boolean }, formData: FormData) => {
      Object.entries(stars).forEach(([k, v]) => formData.set(k, String(v * 2)))
      formData.set('user_email', email || 'anonymous')
      const result = await submitRating(formData)
      return { error: result.error ?? '', success: result.success ?? false }
    },
    initialState
  )

  const StarRow = ({ metric }: { metric: typeof PRE_METRICS[0] }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.4rem 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '.54rem', textTransform: 'uppercase', letterSpacing: '.05em', flex: 1, color: 'var(--text)' }}>
        {metric.label}
      </span>
      <div style={{ display: 'flex', gap: '.15rem' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(s => ({ ...s, [metric.key]: n }))}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '.1rem',
              fontSize: '.9rem', lineHeight: 1,
              color: n <= (stars[metric.key] ?? 0) ? 'var(--gold)' : 'var(--border2)',
              transition: 'color .12s',
            }}
          >★</button>
        ))}
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '.54rem', color: 'var(--gold)', minWidth: '28px', textAlign: 'right' }}>
        {stars[metric.key] ? `${stars[metric.key] * 2}/10` : '—'}
      </span>
    </div>
  )

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem', marginBottom: '.75rem' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '1rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border)' }}>
        Community Ratings
      </div>

      {state.success && <div className="status-box ok" style={{ fontSize: '.62rem' }}>✓ Rating submitted</div>}
      {state.error   && <div className="status-box err" style={{ fontSize: '.62rem' }}>{state.error}</div>}

      <form action={formAction}>
        <input type="hidden" name="policy_id" value={policyId} />

        <div style={{ fontFamily: 'var(--mono)', fontSize: '.5rem', textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--gold)', margin: '.5rem 0' }}>
          Pre-Written · Design &amp; Intent
        </div>
        {PRE_METRICS.map(m => <StarRow key={m.key} metric={m} />)}

        <div style={{ fontFamily: 'var(--mono)', fontSize: '.5rem', textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--green)', margin: '.75rem 0 .5rem' }}>
          Post-Written · Execution &amp; Reality
        </div>
        {POST_METRICS.map(m => <StarRow key={m.key} metric={m} />)}

        <div style={{ marginTop: '.85rem' }}>
          <label className="field-label">Your Email (optional — prevents duplicate ratings)</label>
          <input
            type="email"
            className="field-input"
            placeholder="not published publicly"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: '.65rem' }}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isPending || Object.keys(stars).length === 0} style={{ width: '100%', justifyContent: 'center' }}>
          {isPending ? <><span className="spinner" /> Saving…</> : 'Submit Rating'}
        </button>
        {Object.keys(stars).length === 0 && (
          <p style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', color: 'var(--muted2)', textAlign: 'center', marginTop: '.4rem' }}>
            Select at least one star rating above
          </p>
        )}
      </form>
    </div>
  )
}
