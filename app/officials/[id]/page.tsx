import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEntityById, getPolicyById } from '@/lib/queries'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Entity, MediaLink, EntityUpdate } from '@/lib/types'

export const revalidate = 60

interface Props { params: Promise<{ id: string }> }

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const MEDIA_ICONS: Record<string, string> = {
  article: '📰', video: '▶', statement: '📋', press: '📣', other: '🔗',
}

export default async function EntityDetailPage({ params }: Props) {
  const { id } = await params
  const entity = await getEntityById(id)
  if (!entity) notFound()

  const e = entity as Entity
  const initials = e.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const isInst   = e.type === 'institution'

  // Load linked policies
  const linkedPolicies = await Promise.all(
    (e.linked_policies ?? []).map(pid => getPolicyById(pid))
  ).then(ps => ps.filter(Boolean))

  const tlItems = (e.timeline ?? '').split('\n').filter(Boolean).map(line => {
    const [d, ...rest] = line.split('|')
    return { date: d.trim(), text: rest.join('|').trim() }
  })

  const photos    = (e.photos ?? []).filter(Boolean)
  const updates   = ((e.updates ?? []) as EntityUpdate[]).sort((a, b) => b.date.localeCompare(a.date))
  const mediaLinks = (e.media_links ?? []) as MediaLink[]

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Back */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)' }}>
          <Link href="/officials" style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            ← Back to Officials &amp; Institutions
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0 }}>

          {/* ── LEFT ── */}
          <div style={{ borderRight: '1px solid var(--border)' }}>

            {/* Primary photo */}
            {photos.length > 0 ? (
              <div>
                <img src={photos[0]} alt={e.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
                {photos.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.35rem', padding: '.35rem' }}>
                    {photos.slice(1, 5).map((url, i) => (
                      <img key={i} src={url} alt={`Photo ${i + 2}`} style={{ aspectRatio: '1', objectFit: 'cover', border: '1px solid var(--border)', display: 'block', width: '100%' }} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '2.5rem 1.75rem 0', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: isInst ? 'var(--radius)' : '50%',
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--display)', fontSize: isInst ? '.9rem' : '1.5rem',
                  fontWeight: 900, color: 'var(--gold)', flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.3rem' }}>
                    {isInst ? 'Institution' : 'Public Official'}
                  </div>
                  <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '.25rem' }}>{e.name}</h1>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{e.role}</div>
                </div>
              </div>
            )}

            {/* Meta bar */}
            <div style={{ padding: '1rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'center' }}>
              {e.party && e.party !== 'GOV' && <span className={`tag tag-${e.party}`}>{e.party}</span>}
              {e.tenure && <span style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted)' }}>Tenure: <strong style={{ color: 'var(--text)' }}>{e.tenure}</strong></span>}
              {e.website && <a href={e.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--gold)', textDecoration: 'none' }}>↗ {e.website.replace('https://','')}</a>}
              <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                {e.tags.map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
              </div>
            </div>

            {/* Chapters */}
            <div style={{ padding: '0 1.75rem' }}>
              <div className="chapter">
                <div className="ch-num">Profile</div>
                <div className="ch-title">Overview</div>
                <div className="ch-body">{e.bio.split('\n').filter(Boolean).map((l, i) => <p key={i}>{l}</p>)}</div>
              </div>
              <div className="chapter">
                <div className="ch-num">Background</div>
                <div className="ch-title">History &amp; Context</div>
                <div className="ch-body">{(e.background || 'No background on record.').split('\n').filter(Boolean).map((l, i) => <p key={i}>{l}</p>)}</div>
              </div>
              <div className="chapter">
                <div className="ch-num">Timeline</div>
                <div className="ch-title">Key Events</div>
                <div className="ch-body">
                  {tlItems.length === 0 ? <p style={{ color: 'var(--muted)' }}>No timeline entries.</p> : (
                    <div className="tl">
                      {tlItems.map((item, i) => (
                        <div key={i} className="tl-item">
                          <div className="tl-dot" />
                          <div className="tl-date">{item.date}</div>
                          <div className="tl-text">{item.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {linkedPolicies.length > 0 && (
                <div className="chapter">
                  <div className="ch-num">Related</div>
                  <div className="ch-title">Linked Policies &amp; Decisions</div>
                  <div className="ch-body">
                    {linkedPolicies.map(p => p && (
                      <Link key={p.id} href={`/policies/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.55rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                          <span className={`outcome-badge ${p.outcome_status}`} style={{ fontSize: '.5rem', padding: '.1rem .35rem' }}>{p.outcome_status}</span>
                          <span style={{ flex: 1, fontSize: '.82rem', fontWeight: 600 }}>{p.title}</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '.54rem', color: 'var(--muted2)' }}>{p.date?.slice(0,4)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT sidebar ── */}
          <div style={{ padding: '1.5rem 1.25rem' }}>

            {/* Updates */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem', marginBottom: '.75rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '.85rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border)' }}>
                Recent Updates
              </div>
              {updates.length === 0
                ? <div style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', color: 'var(--muted2)' }}>No updates on record.</div>
                : updates.map((u, i) => (
                  <div key={i} style={{ paddingBottom: '.75rem', marginBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '.54rem', color: 'var(--muted2)', marginBottom: '.25rem' }}>{fmtDate(u.date)}</div>
                    <div style={{ fontSize: '.82rem', lineHeight: 1.55, fontWeight: 300 }}>{u.text}</div>
                  </div>
                ))
              }
            </div>

            {/* Media links */}
            {mediaLinks.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem', marginBottom: '.75rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '.85rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border)' }}>
                  Media &amp; Press Links
                </div>
                {mediaLinks.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '.65rem', paddingBottom: '.7rem', marginBottom: '.7rem', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '.5rem', textTransform: 'uppercase', letterSpacing: '.07em', padding: '.14rem .38rem', borderRadius: 'var(--radius)', background: 'rgba(52,152,219,.12)', color: 'var(--blue)', border: '1px solid rgba(52,152,219,.2)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '.1rem' }}>
                      {MEDIA_ICONS[m.type] ?? '🔗'} {m.type}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 600, marginBottom: '.1rem', lineHeight: 1.35 }}>{m.title}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '.52rem', color: 'var(--muted2)' }}>{m.source}{m.date && ` · ${fmtDate(m.date)}`}</div>
                      {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', fontSize: '.72rem', textDecoration: 'none', display: 'inline-block', marginTop: '.18rem' }}>↗ {m.url.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Budget */}
            {e.budget && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '.65rem' }}>Budget / Resources</div>
                <div style={{ fontSize: '.82rem', fontWeight: 300, lineHeight: 1.55 }}>{e.budget}</div>
              </div>
            )}
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
