import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '3rem' }}>🔍</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Profile Not Found</h1>
      <p style={{ color: 'var(--text-2)', maxWidth: '360px' }}>This profile doesn't exist or has been removed.</p>
      <Link href="/officials" className="btn btn-primary">← Back to Officials</Link>
    </div>
  );
}
