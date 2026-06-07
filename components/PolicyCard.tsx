import Link from 'next/link';
import type { Policy, Tag } from '@/lib/types';
import { TagChip } from './TagChip';

interface PolicyCardProps {
  policy: Policy;
  tags?: Tag[];
}

const OUTCOME_LABELS: Record<string, string> = {
  pending: 'Pending',
  positive: 'Positive',
  negative: 'Negative',
};

function avgRatings(r: Record<string, number>): number | null {
  const vals = Object.values(r).filter(v => typeof v === 'number');
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function PolicyCard({ policy, tags }: PolicyCardProps) {
  const preAvg = policy.pre_ratings ? avgRatings(policy.pre_ratings as Record<string, number>) : null;
  const postAvg = policy.post_ratings ? avgRatings(policy.post_ratings as Record<string, number>) : null;

  // Reading time estimate (~200 words/min)
  const wordCount = [policy.intro, policy.background, policy.keydetails, policy.outcome]
    .filter(Boolean).join(' ').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Link href={`/policies/${policy.id}`} className="policy-card-link">
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {policy.category}
          </span>
          <span className={`badge badge-${policy.outcome_status}`}>
            {OUTCOME_LABELS[policy.outcome_status]}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.35 }}>
          {policy.title}
        </h3>

        {/* Intro snippet */}
        {policy.intro && (
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-2)',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {policy.intro}
          </p>
        )}

        {/* Tags */}
        {policy.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {policy.tags.slice(0, 4).map(code => (
              <TagChip key={code} code={code} tags={tags} size="sm" />
            ))}
            {policy.tags.length > 4 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', alignSelf: 'center' }}>
                +{policy.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer meta */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border)',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {policy.date && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                {new Date(policy.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}
              </span>
            )}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{readTime} min read</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {postAvg !== null && (
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                ★ {postAvg.toFixed(1)}
              </span>
            )}
            {preAvg !== null && postAvg === null && (
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                ★ {preAvg.toFixed(1)} pre
              </span>
            )}
            {policy.sponsor && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{policy.sponsor}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
