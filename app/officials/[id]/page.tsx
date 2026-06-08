import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getEntity, getTags, getPolicies } from '@/lib/queries';
import { TagChip } from '@/components/TagChip';
import { MediaLinks } from '@/components/MediaLinks';
import { EntityPhotoGallery } from '@/components/EntityPhotoGallery';
import { Footer } from '@/components/Footer';

export const revalidate = 60;
interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const e = await getEntity(id);
  if (!e) return { title: 'Not Found' };
  return { title: `${e.name} — Public Profile` };
}

function fmtDate(d: string) {
  try { return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); } catch { return d; }
}

export default async function OfficialDetail({ params }: Props) {
  const { id } = await params;
  const [entity, tags, allPolicies] = await Promise.all([getEntity(id), getTags(), getPolicies()]);
  if (!entity) notFound();

  const linked = allPolicies.filter(p => entity.linked_policies?.includes(p.id));

  const SECTIONS = [
    { label:'Biography', text: entity.bio },
    { label:'Background', text: entity.background },
    { label:'Timeline', text: entity.timeline },
  ].filter(s => s.text?.trim());

  return (
    <>
      <div className="entity-detail-grid fade-up">
        {/* LEFT COLUMN */}
        <div>
          <EntityPhotoGallery photos={entity.photos ?? []} name={entity.name} />

          <div className="rating-card" style={{ marginTop:'1rem' }}>
            <div className="rc-head">Profile</div>
            {[
              ['Type', entity.type === 'official' ? '👤 Official' : '🏛 Institution'],
              ['Party', entity.party],
              ['Tenure', entity.tenure],
              ['Status', entity.status],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k as string} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.35rem 0', borderBottom:'1px solid var(--border)', fontSize:'.78rem' }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:'.54rem', textTransform:'uppercase', color:'var(--muted)' }}>{k}</span>
                <span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
            {entity.website && (
              <a href={entity.website} target="_blank" rel="noopener" style={{ display:'block', marginTop:'.5rem', color:'var(--gold)', fontFamily:'var(--mono)', fontSize:'.62rem' }}>
                🌐 Website ↗
              </a>
            )}
            {entity.budget && (
              <a href={entity.budget} target="_blank" rel="noopener" style={{ display:'block', marginTop:'.3rem', color:'var(--gold)', fontFamily:'var(--mono)', fontSize:'.62rem' }}>
                💰 Budget Doc ↗
              </a>
            )}
          </div>

          {entity.tags?.length > 0 && (
            <div style={{ marginTop:'1rem' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'.55rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--gold)', marginBottom:'.5rem' }}>Tags</div>
              <div className="card-tags">
                {entity.tags.map(code => <TagChip key={code} code={code} tags={tags} />)}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <Link href="/officials" className="detail-back">← Back to officials</Link>
          <div className="detail-eyebrow">{entity.type === 'official' ? 'Public Official' : 'Institution'}</div>
          <h1 className="detail-title">{entity.name}</h1>
          {entity.role && (
            <p style={{ fontSize:'1rem', color:'var(--muted)', fontWeight:300, marginBottom:'.25rem' }}>{entity.role}</p>
          )}
          {entity.tenure && (
            <p style={{ fontFamily:'var(--mono)', fontSize:'.65rem', color:'var(--muted2)', marginBottom:'1.5rem' }}>{entity.tenure}</p>
          )}

          {SECTIONS.map(s => (
            <div key={s.label} className="chapter">
              <div className="ch-title">{s.label}</div>
              <div className="ch-body">
                {s.text!.split('\n').filter(Boolean).map((p,i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          ))}

          {entity.updates?.length > 0 && (
            <div className="chapter">
              <div className="ch-title">Updates</div>
              <div className="tl">
                {entity.updates.map((u,i) => (
                  <div key={i} className="tl-item">
                    <div className="tl-date">{u.date ? fmtDate(u.date) : ''}</div>
                    <div className="tl-dot" />
                    <div className="tl-text">{u.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entity.media_links?.length > 0 && (
            <div className="chapter">
              <MediaLinks links={entity.media_links} />
            </div>
          )}

          {linked.length > 0 && (
            <div className="chapter">
              <div className="ch-title">Linked Policies</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'.5px' }}>
                {linked.map(p => (
                  <Link key={p.id} href={`/policies/${p.id}`} style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'.7rem .9rem', background:'var(--surface)', border:'1px solid var(--border)',
                    textDecoration:'none', transition:'background .15s',
                  }}>
                    <span style={{ fontSize:'.85rem', fontWeight:600, color:'var(--text)' }}>{p.title}</span>
                    <span className={`outcome-badge ${p.outcome_status}`}>{p.outcome_status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
