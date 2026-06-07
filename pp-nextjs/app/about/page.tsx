import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Public Profile Ghana',
  description: 'Learn about the Public Profile project and how it tracks accountability in Ghana.',
};

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '760px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent-dim-2)',
          borderRadius: '100px',
          padding: '0.25em 0.75em',
          marginBottom: '1rem',
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            An Updatedly Initiative
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
          About Public Profile
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Public Profile is Ghana's first open civic accountability tracker — built to help ordinary Ghanaians understand what government policies actually mean, where the money goes, and who is responsible.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {[
          {
            icon: '🎯',
            title: 'Our Mission',
            body: 'We believe accountability starts with understanding. Too often, Ghanaian governance decisions are announced through press releases and partisan framing that ordinary people can\'t navigate. Public Profile cuts through that — presenting policies, decisions, and official conduct in plain language with sourced evidence.'
          },
          {
            icon: '🔍',
            title: 'What We Track',
            body: 'Every policy on this platform includes its category, sponsor, party affiliation, detailed breakdown, financial accountability data, references, and both editorial and community ratings. Public official profiles show career histories, linked policies, media coverage, and flagged concerns.'
          },
          {
            icon: '⚖️',
            title: 'Our Principles',
            body: 'Factual, not partisan. We track policies under NPP and NDC governments equally. We do not editorially advocate for any party. Our ratings measure design and execution quality — not political alignment. Every claim is sourced.'
          },
          {
            icon: '📺',
            title: 'The Updatedly Channel',
            body: 'Public Profile is the data backbone of Updatedly — a YouTube channel breaking down complex Ghanaian national topics for educated viewers aged 25-35. Short, sourced, sardonic — not commentary, just clarity.'
          },
          {
            icon: '🤝',
            title: 'Community',
            body: 'Sign in with Google to rate policies across 8 dimensions and join the discussion. Community ratings are averaged and displayed alongside editorial scores. Your input matters.'
          },
        ].map(({ icon, title, body }) => (
          <div key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '0.1rem' }}>{icon}</span>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '0.925rem' }}>{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: 'var(--accent-dim)',
        border: '1px solid var(--accent-dim-2)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Ready to explore?</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>Browse policies and official profiles.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary btn-sm">View Policies</Link>
          <Link href="/officials" className="btn btn-secondary btn-sm">View Officials</Link>
        </div>
      </div>

      {/* Rating framework */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Rating Framework</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          Policies are rated across 8 dimensions on a 0–10 scale. Pre-implementation ratings assess design and intent; post-implementation ratings assess execution and real-world impact.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            ['Transparency', 'How open and accessible is information?'],
            ['Representation', 'Does it serve ordinary Ghanaians?'],
            ['Justification', 'Is there clear evidence-based reasoning?'],
            ['Prudence', 'Was it financially and strategically sensible?'],
            ['Effectiveness', 'Has it achieved its stated goals?'],
            ['User Experience', 'Can citizens easily access or benefit?'],
            ['Equity', 'Is the impact fair across different groups?'],
            ['Cost-Efficiency', 'Does the cost justify the benefit?'],
          ].map(([dim, desc]) => (
            <div key={dim} className="card" style={{ padding: '0.875rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{dim}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
