import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPolicy, getTags, getComments, getRatings } from '@/lib/queries';
import { TagChip } from '@/components/TagChip';
import { FinanceBlock } from '@/components/FinanceBlock';
import { RatingForm } from '@/components/RatingForm';
import { CommentForm } from '@/components/CommentForm';
import type { RatingDimensions } from '@/lib/types';
import { RATING_DIMENSIONS } from '@/lib/types';

export const revalidate = 60;

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const policy = await getPolicy(id);
  if (!policy) return { title: 'Policy Not Found' };
  return {
    title: `${policy.title} — Public Profile`,
    description: policy.intro?.slice(0, 160),
  };
}

function RatingBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', width: '130px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: 'var(--bg-4)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', width: '32px', textAlign: 'right' }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function Section({ label, content }: { label: string; content: string }) {
  if (!content?.trim()) return null;
  return (
    <section>
      <div className="section-label">{label}</div>
      <div style={{ fontSize: '0.925rem', color: 'var(--text-2)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
        {content}
      </div>
    </section>
  );
}

export default async function PolicyDetailPage({ params }: Props) {
  const { id } = await params;
  const [policy, tags, comments, ratings] = await Promise.all([
    getPolicy(id),
    getTags(),
    getComments(id),
    getRatings(id),
  ]);

  if (!policy) notFound();

  const preRatings = policy.pre_ratings as RatingDimensions;
  const postRatings = policy.post_ratings as RatingDimensions;
  const hasPreRatings = Object.keys(preRatings ?? {}).length > 0;
  const hasPostRatings = Object.keys(postRatings ?? {}).length > 0;

  const wordCount = [policy.intro, policy.background, policy.keydetails, policy.outcome]
    .filter(Boolean).join(' ').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        gap: '2rem',
        alignItems: 'start',
      }}
        className="policy-detail-grid"
      >
        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {policy.category}
              </span>
              <span>·</span>
              <span className={`badge badge-${policy.outcome_status}`}>
                {policy.outcome_status.charAt(0).toUpperCase() + policy.outcome_status.slice(1)}
              </span>
              <span className={`badge badge-${policy.status}`}>{policy.status}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                {readTime} min read
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.25 }}>
              {policy.title}
            </h1>

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
              {policy.sponsor && (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
                  <strong>Sponsor:</strong> {policy.sponsor}
                </span>
              )}
              {policy.party && (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
                  <strong>Party:</strong> {policy.party}
                </span>
              )}
              {policy.date && (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
                  {new Date(policy.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>

            {policy.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {policy.tags.map(code => <TagChip key={code} code={code} tags={tags} />)}
              </div>
            )}
          </div>

          <hr className="divider" style={{ margin: 0 }} />

          {/* Content sections */}
          {policy.intro && <Section label="Overview" content={policy.intro} />}
          {policy.background && <Section label="Background" content={policy.background} />}
          {policy.keydetails && <Section label="Key Details" content={policy.keydetails} />}
          {policy.timeline && <Section label="Timeline" content={policy.timeline} />}
          {policy.structure && <Section label="Structure" content={policy.structure} />}
          {policy.outcome && <Section label="Outcome" content={policy.outcome} />}

          {/* Finance */}
          {policy.finance && Object.keys(policy.finance).length > 0 && (
            <FinanceBlock finance={policy.finance} />
          )}

          {/* Refs */}
          {policy.refs?.length > 0 && (
            <section>
              <div className="section-label">References</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {policy.refs.map((ref, i) => (
                  <a
                    key={i}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    ↗ {ref.label}
                  </a>
                ))}
              </div>
            </section>
          )}

          <hr className="divider" style={{ margin: 0 }} />

          {/* Community ratings */}
          <RatingForm policyId={policy.id} existingRatings={ratings} />

          <hr className="divider" style={{ margin: 0 }} />

          {/* Comments */}
          <CommentForm policyId={policy.id} initialComments={comments} />
        </div>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Admin ratings */}
          {(hasPreRatings || hasPostRatings) && (
            <div className="card">
              <div className="section-label">Admin Ratings</div>
              {hasPreRatings && (
                <div style={{ marginBottom: hasPostRatings ? '1.25rem' : 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: '0.625rem' }}>
                    PRE-IMPLEMENTATION
                  </div>
                  {RATING_DIMENSIONS.map(dim => {
                    const val = (preRatings as Record<string, number>)[dim];
                    return typeof val === 'number' ? <RatingBar key={dim} label={dim} value={val} /> : null;
                  })}
                </div>
              )}
              {hasPostRatings && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: '0.625rem' }}>
                    POST-IMPLEMENTATION
                  </div>
                  {RATING_DIMENSIONS.map(dim => {
                    const val = (postRatings as Record<string, number>)[dim];
                    return typeof val === 'number' ? <RatingBar key={dim} label={dim} value={val} /> : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick facts */}
          <div className="card">
            <div className="section-label">Quick Facts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                ['Category', policy.category],
                ['Sponsor', policy.sponsor],
                ['Party', policy.party],
                ['Date', policy.date ? new Date(policy.date).toLocaleDateString('en-GB') : null],
                ['Status', policy.status],
                ['Outcome', policy.outcome_status],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>{k}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .policy-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
