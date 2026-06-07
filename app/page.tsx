import { getPolicies, getStats } from '@/lib/queries'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PolicyCard from '@/components/PolicyCard'

export const revalidate = 60 // ISR: revalidate every 60s

export default async function HomePage() {
  const [policies, stats] = await Promise.all([getPolicies(), getStats()])

  const CATEGORIES = ['All', 'Economic Policy', 'Governance Reform', 'Energy Policy',
    'Health Policy', 'Infrastructure', 'Education Policy', 'Security & Defence', 'Trade & Commerce']

  const TAGS = ['NPP','NDC','PEP','COMP','CORR','ADM','REPU','CONT','NCOM']

  return (
    <>
      <Header />

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-track">
          <span>Ghana Accountability Tracker</span>
          <span>{stats.policies} Policies Tracked</span>
          <span>{stats.entities} Officials &amp; Institutions</span>
          <span>{stats.comments} Public Comments</span>
          <span>An Updatedly Initiative</span>
          <span>Transparency · Accountability · Integrity</span>
          <span>Ghana Accountability Tracker</span>
          <span>{stats.policies} Policies Tracked</span>
          <span>{stats.entities} Officials &amp; Institutions</span>
        </div>
      </div>

      <main>
        {/* Hero */}
        <section style={{
          padding: 'clamp(2.5rem,6vw,5rem) 1.75rem 2rem',
          borderBottom: '1px solid var(--border)',
          maxWidth: '900px',
        }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase',
            letterSpacing: '.14em', color: 'var(--gold)', marginBottom: '.85rem',
          }}>
            Ghana · 2020–Present
          </div>
          <h1 style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(2.2rem,5vw,3.8rem)',
            fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-.01em',
          }}>
            Tracking Government{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Decisions</em>
            {' &'}<br />Holding Power Accountable.
          </h1>
          <p style={{
            fontSize: '.95rem', fontWeight: 300, color: 'var(--muted)',
            lineHeight: 1.7, maxWidth: '560px', marginBottom: '1.25rem',
          }}>
            Public Profile documents every major government policy, legislative shift, and official
            decision affecting Ghanaians — plainly, fairly, and permanently on record.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { n: stats.policies,  l: 'Policies' },
              { n: stats.entities,  l: 'Officials & Institutions' },
              { n: stats.comments,  l: 'Public Comments' },
            ].map(({ n, l }) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--display)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '-.02em' }}>{n}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Filter note (client-side filtering via URL params would go here) */}
        <section style={{ padding: '1rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.56rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)' }}>Filter by tag:</span>
          {TAGS.map(t => (
            <span key={t} className={`tag tag-${t}`}>{t}</span>
          ))}
        </section>

        {/* Policy grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          padding: '0',
        }}>
          {policies.length === 0 ? (
            <div style={{
              gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem',
              color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: '.75rem',
            }}>
              No published policies yet. Add them via the admin dashboard.
            </div>
          ) : (
            policies.map(p => <PolicyCard key={p.id} policy={p} />)
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
