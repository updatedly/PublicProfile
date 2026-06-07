import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getEntity, getTags, getPolicies } from '@/lib/queries';
import { TagChip } from '@/components/TagChip';
import { PhotoGallery } from '@/components/PhotoGallery';
import { MediaLinks } from '@/components/MediaLinks';

export const revalidate = 60;

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entity = await getEntity(id);
  if (!entity) return { title: 'Profile Not Found' };
  return { title: `${entity.name} — Public Profile`, description: entity.bio?.slice(0, 160) };
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

export default async function OfficialDetailPage({ params }: Props) {
  const { id } = await params;
  const [entity, tags, allPolicies] = await Promise.all([
    getEntity(id),
    getTags(),
    getPolicies(),
  ]);

  if (!entity) notFound();

  const linkedPolicies = allPolicies.filter(p => entity.linked_policies?.includes(p.id));

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}
        className="official-detail-grid"
      >
        {/* Left: Photo + meta */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Photo gallery */}
          <PhotoGallery photos={entity.photos ?? []} name={entity.name} />

          {/* Meta card */}
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                ['Type', entity.type === 'official' ? '👤 Official' : '🏛️ Institution'],
                ['Party', entity.party],
                ['Tenure', entity.tenure],
                ['Status', entity.status],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>{k}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
              {entity.website && (
                <a href={entity.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                  🌐 Website ↗
                </a>
              )}
              {entity.budget && (
                <a href={entity.budget} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                  💰 Budget Doc ↗
                </a>
              )}
            </div>
          </div>

          {/* Tags */}
          {entity.tags?.length > 0 && (
            <div>
              <div className="section-label">Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {entity.tags.map(code => <TagChip key={code} code={code} tags={tags} />)}
              </div>
            </div>
          )}
        </aside>

        {/* Right: Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className={`badge badge-${entity.status}`}>{entity.status}</span>
              <span className="badge" style={{ background: 'var(--bg-4)', color: 'var(--text-2)' }}>
                {entity.type === 'official' ? 'Official' : 'Institution'}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 700, marginBottom: '0.25rem' }}>
              {entity.name}
            </h1>
            {entity.role && (
              <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', marginBottom: '0.25rem' }}>{entity.role}</p>
            )}
            {entity.tenure && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {entity.tenure}
              </p>
            )}
          </div>

          <hr className="divider" style={{ margin: 0 }} />

          <Section label="Biography" content={entity.bio} />
          <Section label="Background" content={entity.background} />
          <Section label="Timeline" content={entity.timeline} />

          {/* Updates */}
          {entity.updates?.length > 0 && (
            <section>
              <div className="section-label">Recent Updates</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {entity.updates.map((u, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <div style={{
                      flexShrink: 0, width: '2px', background: 'var(--accent)',
                      borderRadius: '1px', alignSelf: 'stretch', minHeight: '20px',
                    }} />
                    <div>
                      {u.date && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>
                          {new Date(u.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      )}
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{u.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Media links */}
          {entity.media_links?.length > 0 && (
            <MediaLinks links={entity.media_links} />
          )}

          {/* Linked policies */}
          {linkedPolicies.length > 0 && (
            <section>
              <div className="section-label">Linked Policies</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {linkedPolicies.map(p => (
                  <Link key={p.id} href={`/policies/${p.id}`} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', background: 'var(--bg-3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', textDecoration: 'none', gap: '0.5rem',
                    transition: 'border-color var(--transition)',
                  }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{p.title}</span>
                    <span className={`badge badge-${p.outcome_status}`} style={{ flexShrink: 0 }}>
                      {p.outcome_status}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .official-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
