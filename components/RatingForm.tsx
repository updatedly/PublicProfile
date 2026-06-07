'use client';

import { useState, useEffect } from 'react';
import type { Rating, RatingDimensions } from '@/lib/types';
import { RATING_DIMENSIONS, RATING_DIMENSION_DESCRIPTIONS } from '@/lib/types';
import { submitRating } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';

interface RatingFormProps {
  policyId: string;
  existingRatings: Rating[];
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-row" role="radiogroup">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className="star-btn"
          aria-label={`${star} star`}
          style={{ color: star <= (hover || value) ? 'var(--accent)' : 'var(--border-2)' }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star * 2)}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', alignSelf: 'center', marginLeft: '0.25rem', fontFamily: 'var(--font-mono)' }}>
          {value}/10
        </span>
      )}
    </div>
  );
}

function avgDimension(ratings: Rating[], dim: string): number | null {
  const vals = ratings.map(r => (r.ratings as Record<string, number>)[dim]).filter(v => typeof v === 'number');
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function RatingForm({ policyId, existingRatings }: RatingFormProps) {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [userChecked, setUserChecked] = useState(false);
  const [myRatings, setMyRatings] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser({ id: u.id, email: u.email!, name: u.user_metadata?.full_name ?? u.email! });
        const existing = existingRatings.find(r => r.user_email === u.email);
        if (existing) setMyRatings(existing.ratings as Record<string, number>);
      }
      setUserChecked(true);
    })();
  }, [existingRatings]);

  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await submitRating({
        policy_id: policyId,
        user_id: user.id,
        user_email: user.email,
        ratings: myRatings,
      });
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save rating.');
    } finally {
      setSaving(false);
    }
  };

  const communityCount = existingRatings.length;

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div className="section-label" style={{ marginBottom: 0 }}>Community Ratings</div>
        {communityCount > 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
            {communityCount} {communityCount === 1 ? 'rating' : 'ratings'}
          </span>
        )}
      </div>

      {communityCount > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {RATING_DIMENSIONS.map(dim => {
            const avg = avgDimension(existingRatings, dim);
            if (avg === null) return null;
            const pct = (avg / 10) * 100;
            return (
              <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', width: '130px', flexShrink: 0 }}>{dim}</span>
                <div style={{ flex: 1, height: '6px', background: 'var(--bg-4)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', width: '32px', textAlign: 'right' }}>
                  {avg.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!userChecked ? (
        <div style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Loading…</div>
      ) : !user ? (
        <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '0.875rem' }}>
            Sign in to rate this policy across 8 dimensions.
          </p>
          <button onClick={handleSignIn} className="btn btn-primary">Sign in with Google</button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
              Rating as <strong style={{ color: 'var(--text)' }}>{user.name}</strong>
            </span>
            {saved && <span className="badge badge-positive">Saved ✓</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
            {RATING_DIMENSIONS.map(dim => (
              <div key={dim}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', display: 'block', marginBottom: '0.2rem' }}>{dim}</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.4rem' }}>
                  {RATING_DIMENSION_DESCRIPTIONS[dim]}
                </p>
                <StarInput
                  value={(myRatings[dim] ?? 0) / 2}
                  onChange={v => setMyRatings(prev => ({ ...prev, [dim]: v }))}
                />
              </div>
            ))}
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={saving || Object.keys(myRatings).length === 0}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : saved ? 'Update Rating' : 'Submit Rating'}
          </button>
        </div>
      )}
    </section>
  );
}
