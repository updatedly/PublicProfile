import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  const PRE_METRICS = [
    { label: 'Transparency',   desc: 'Is it easy for the average citizen to understand?' },
    { label: 'Representation', desc: 'Were key stakeholders and community members actively consulted?' },
    { label: 'Justification',  desc: 'Does it directly address a real, verified national issue?' },
    { label: 'Prudence',       desc: 'Do we trust the government to execute this without technical failure or wasting public funds?' },
  ]
  const POST_METRICS = [
    { label: 'Effectiveness',  desc: 'Did it actually solve the targeted problem?' },
    { label: 'User Experience',desc: 'How difficult or accessible is it for citizens to interact with it?' },
    { label: 'Equity',         desc: 'Did the policy distribute benefits fairly and help everyone equally?' },
    { label: 'Cost-Efficiency',desc: 'Was it a wasteful expenditure or a good use of public funds?' },
  ]
  const TAGS = [
    { code:'NPP',  name:'New Patriotic Party',          desc:'Affiliated with or initiated by the New Patriotic Party.' },
    { code:'NDC',  name:'National Democratic Congress', desc:'Affiliated with or initiated by the National Democratic Congress.' },
    { code:'PEP',  name:'Politically Exposed Person',   desc:'Someone in a position of public power, or in close relation to such a person.' },
    { code:'COMP', name:'Compromised',                  desc:'Evidence or strong indication of compromised integrity or conflict of interest.' },
    { code:'CORR', name:'Alleged Corruption',           desc:'Associated with active investigations, leaks, or public allegations of corruption.' },
    { code:'ADM',  name:'Adverse Maleficence',          desc:'Involved in documented misconduct, illegal activities, or explicit criminality.' },
    { code:'REPU', name:'Reputational Risk',            desc:'Subject to intense public pushback, scrutiny, negative attention, stigma, or widespread backlash.' },
    { code:'CONT', name:'Controversy',                  desc:'Linked to extreme polarisation, social or political prejudices, or systemic debate.' },
    { code:'NCOM', name:'Non-Compliance',               desc:'Documented violation, breach of regulatory frameworks, or operational wrongdoing.' },
  ]

  const section = { padding: '2rem 0', borderBottom: '1px solid var(--border)' }
  const h2 = { fontFamily: 'var(--display)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '.75rem' }
  const body = { fontSize: '.88rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.72, marginBottom: '1rem' }

  return (
    <>
      <Header />
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 1.75rem' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--gold)', marginBottom: '.85rem' }}>
          About Public Profile
        </div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem' }}>
          What this platform does and <em style={{ color: 'var(--gold)' }}>why it matters</em>
        </h1>

        <div style={section}>
          <p style={body}>
            Public Profile is a civic accountability tracker for Ghana, built and maintained by{' '}
            <a href="https://youtube.com/@updatedlyinc" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>Updatedly</a>.
            It documents government policies, legislative decisions, public officials, and state institutions
            from 2020 to the present — plainly, fairly, and permanently on record.
          </p>
          <p style={body}>
            Every policy entry follows a six-part structure: Introduction, Background, Key Details,
            Timeline, Cost Structure &amp; Finance, and Outcome. This ensures consistent, comparable records
            across administrations and policy areas.
          </p>
        </div>

        {/* Rating Framework */}
        <div style={section}>
          <h2 style={h2}>Rating Framework</h2>
          <p style={body}>
            Every policy is assessed across two phases — before and after implementation — scored 0–10 across
            eight dimensions by the editorial team. The public can also submit independent community ratings.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--gold)', marginBottom: '.3rem' }}>Pre-Written Metrics</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted2)', marginBottom: '.75rem' }}>Design &amp; Intent</div>
              <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: '.75rem', lineHeight: 1.6, fontWeight: 300 }}>Evaluates the policy before or as it launches — focusing on how well it was planned and designed.</p>
              {PRE_METRICS.map(m => (
                <div key={m.label} style={{ marginBottom: '.55rem' }}>
                  <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{m.label}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 300 }}>{m.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--green)', marginBottom: '.3rem' }}>Post-Written Metrics</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted2)', marginBottom: '.75rem' }}>Execution &amp; Reality</div>
              <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: '.75rem', lineHeight: 1.6, fontWeight: 300 }}>Evaluates the policy after implementation — focusing on its real-world impact and results.</p>
              {POST_METRICS.map(m => (
                <div key={m.label} style={{ marginBottom: '.55rem' }}>
                  <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{m.label}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 300 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tag Glossary */}
        <div style={section}>
          <h2 style={h2}>Risk Tag Glossary</h2>
          <p style={body}>Tags classify the nature of concern attached to a policy or public figure:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5px' }}>
            {TAGS.map(t => (
              <div key={t.code} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '.75rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className={`tag tag-${t.code}`} style={{ flexShrink: 0 }}>{t.code}</span>
                <div>
                  <div style={{ fontSize: '.85rem', fontWeight: 600, marginBottom: '.12rem' }}>{t.name}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)', fontWeight: 300 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial */}
        <div style={{ ...section, borderBottom: 'none' }}>
          <h2 style={h2}>Editorial Principles</h2>
          <p style={body}>Public Profile does not advocate for or against any political party. Every entry is documented factually, sourced from public records, official documents, and credible journalism. Where facts are disputed, both positions are noted. Ratings reflect the editorial team&apos;s research-based assessment, not political opinion.</p>
          <p style={body}>All community comments are open for posting without registration. They represent individual views and do not reflect the position of Updatedly.</p>
        </div>
      </main>
      <Footer />

      <style>{`
        @media(max-width:640px){
          main > div > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
