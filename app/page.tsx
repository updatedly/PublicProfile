import { getPolicies, getTags } from '@/lib/queries';
import { PolicyListClient } from '@/components/PolicyListClient';

export const revalidate = 60;

export default async function HomePage() {
  const [policies, tags] = await Promise.all([getPolicies(), getTags()]);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Hero */}
      <div style={{ marginBottom: '2.5rem', maxWidth: '680px' }}>
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
            🇬🇭 Ghana Accountability Tracker
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Track the policies shaping Ghana
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.65 }}>
          Transparent, sourced breakdowns of government decisions — so every Ghanaian can follow what's being done in their name.
        </p>
      </div>

      <PolicyListClient initialPolicies={policies} tags={tags} />
    </div>
  );
}
