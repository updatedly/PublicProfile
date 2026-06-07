'use client'

import { useActionState, useRef } from 'react'
import { submitComment } from '@/lib/actions'

interface Props { policyId: string }

const initialState: { error: string; success: boolean } = { error: '', success: false }

export default function CommentForm({ policyId }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string; success: boolean }, formData: FormData) => {
      const result = await submitComment(formData)
      if (result.success) formRef.current?.reset()
      return { error: result.error ?? '', success: result.success ?? false }
    },
    initialState
  )

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '.56rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '1rem' }}>
        Leave a Comment
      </div>

      {state.success && (
        <div className="status-box ok" style={{ marginBottom: '1rem' }}>
          ✓ Comment posted successfully
        </div>
      )}
      {state.error && (
        <div className="status-box err" style={{ marginBottom: '1rem' }}>
          {state.error}
        </div>
      )}

      <form ref={formRef} action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        <input type="hidden" name="policy_id" value={policyId} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          <div>
            <label className="field-label">Your Name *</label>
            <input
              name="user_name"
              className="field-input"
              placeholder="e.g. Kwame Asante"
              required
              maxLength={80}
            />
          </div>
          <div>
            <label className="field-label">Email (optional)</label>
            <input
              name="user_email"
              type="email"
              className="field-input"
              placeholder="not published publicly"
            />
          </div>
        </div>

        <div>
          <label className="field-label">Comment *</label>
          <textarea
            name="text"
            className="field-input"
            rows={4}
            placeholder="Share your perspective on this policy…"
            required
            maxLength={2000}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isPending}
          >
            {isPending ? <><span className="spinner" /> Posting…</> : 'Post Comment'}
          </button>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', color: 'var(--muted2)' }}>
            All comments are moderated
          </span>
        </div>
      </form>
    </div>
  )
}
