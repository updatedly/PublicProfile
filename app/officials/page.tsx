import Link from 'next/link'
import { getEntities } from '@/lib/queries'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Entity } from '@/lib/types'

export const revalidate = 60

export default async function OfficialsPage() {
  const entities = await getEntities()

  const officials    = entities.filter(e => e.type === 'official')
  const institutions = entities.filter(e => e.type === 'institution')

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section style={{ padding: 'clamp(2rem,5vw,4rem) 1.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--gold)', marginBottom: '.75rem' }}>
            Public Officials &amp; Institutions
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '.75rem' }}>
            The People &amp; Bodies<br /><em style={{ color: 'var(--gold)' }}>Shaping Policy</em>
          </h1>
          <p style={{ fontSize: '.9rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.7, maxWidth: '520px' }}>
            Profiles of ministers, officials, agencies, and institutions — their roles, timelines, and linked decisions.
          </p>
        </section>

        {/* Officials */}
        {officials.length > 0 && (
          <section style={{ padding: '0 1.75rem' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '.56rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', padding: '1.25rem 0 .85rem', borderBottom: '1px solid var(--border)' }}>
              Public Officials — {officials.length}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 0 }}>
              {officials.map(e => <EntityCard key={e.id} entity={e} />)}
            </div>
          </section>
        )}

        {/* Institutions */}
        {institutions.length > 0 && (
          <section style={{ padding: '0 1.75rem', marginTop: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '.56rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', padding: '1.25rem 0 .85rem', borderBottom: '1px solid var(--border)' }}>
              Institutions &amp; Agencies — {institutions.length}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 0 }}>
              {institutions.map(e => <EntityCard key={e.id} entity={e} />)}
            </div>
          </section>
        )}

        {entities.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: '.75rem' }}>
            No officials or institutions published yet.
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

function EntityCard({ entity: e }: { entity: Entity }) {
  const initials = e.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const isInst   = e.type === 'institution'

  return (
    <Link href={`/officials/${e.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article style={{
        padding: '1.35rem',
        cursor: 'pointer',
        transition: 'background .18s',
        borderBottom: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.9rem', marginBottom: '.65rem' }}>
          {/* Avatar */}
          <div style={{
            width: 42, height: 42, flexShrink: 0,
            borderRadius: isInst ? 'var(--radius)' : '50%',
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--display)', fontSize: isInst ? '.7rem' : '1rem',
            fontWeight: 700, color: 'var(--gold)',
          }}>
            {e.photos?.[0]
              ? <img src={e.photos[0]} alt={e.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              : initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '.2rem', lineHeight: 1.2 }}>{e.name}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '.56rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{e.role}</div>
          </div>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '.5rem', textTransform: 'uppercase', letterSpacing: '.07em',
            padding: '.14rem .38rem', borderRadius: 'var(--radius)',
            background: isInst ? 'rgba(39,174,96,.1)' : 'rgba(52,152,219,.12)',
            color: isInst ? 'var(--green)' : 'var(--blue)',
            border: `1px solid ${isInst ? 'rgba(39,174,96,.2)' : 'rgba(52,152,219,.2)'}`,
            flexShrink: 0,
          }}>
            {isInst ? 'Institution' : 'Official'}
          </span>
        </div>
        <p style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.55, marginBottom: '.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {e.bio}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginBottom: '.65rem' }}>
          {e.tags.map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '.6rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.54rem', color: 'var(--muted2)' }}>Tenure: {e.tenure || '—'}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.54rem', color: 'var(--muted2)' }}>{e.linked_policies?.length ?? 0} linked polic{e.linked_policies?.length === 1 ? 'y' : 'ies'}</span>
        </div>
      </article>
    </Link>
  )
}
