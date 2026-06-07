import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '3.5rem' }}>404</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-2)' }}>The page you're looking for doesn't exist.</p>
      <Link href="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}
