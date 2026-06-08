import Link from 'next/link';
import { Footer } from '@/components/Footer';

export default function About() {
  return (
    <>
      <div className="about-shell fade-up">
        <div style={{ fontFamily:'var(--mono)', fontSize:'.6rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--gold)', marginBottom:'.6rem' }}>About</div>
        <h1 style={{ fontFamily:'var(--display)', fontSize:'2.2rem', fontWeight:900, lineHeight:1.1, marginBottom:'1.25rem' }}>
          What is<br />Public Profile?
        </h1>
        <p style={{ fontSize:'.92rem', color:'var(--muted)', lineHeight:1.72, fontWeight:300, marginBottom:'1.5rem', maxWidth:'560px' }}>
          Public Profile is Ghana&apos;s open civic accountability tracker — clear, sourced breakdowns of government policies and decisions so every Ghanaian can follow what&apos;s being done in their name.
        </p>
        {[
          { icon:'🎯', title:'Our Mission', body:'Accountability starts with understanding. Public Profile cuts through partisan framing to present policies in plain language with sourced evidence — factual, not partisan.' },
          { icon:'🔍', title:'What We Track', body:'Every policy on this platform includes its category, sponsor, party affiliation, detailed breakdown, financial accountability data, references, and editorial ratings.' },
          { icon:'⚖️', title:'Our Principles', body:'We track policies under NPP and NDC governments equally. We do not advocate for any party. Our ratings measure design and execution quality — not political alignment. Every claim is sourced.' },
          { icon:'📺', title:'The Updatedely Channel', body:'Public Profile is the data backbone of Updatedely — a YouTube channel breaking down complex Ghanaian national topics for educated viewers.' },
        ].map(({ icon, title, body }) => (
          <div key={title} style={{ padding:'1.25rem 0', borderTop:'1px solid var(--border)', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
            <span style={{ fontSize:'1.3rem', flexShrink:0 }}>{icon}</span>
            <div>
              <div style={{ fontFamily:'var(--display)', fontSize:'1rem', fontWeight:700, marginBottom:'.4rem' }}>{title}</div>
              <p style={{ color:'var(--muted)', lineHeight:1.7, fontSize:'.875rem', fontWeight:300 }}>{body}</p>
            </div>
          </div>
        ))}
        <div style={{ marginTop:'2rem', display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
          <Link href="/" className="btn-primary">Browse Policies</Link>
          <Link href="/officials" className="btn-ghost">View Officials</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
