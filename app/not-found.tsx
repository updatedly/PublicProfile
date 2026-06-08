import Link from 'next/link';
export default function NotFound() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'70vh', gap:'1rem', textAlign:'center', padding:'2rem' }}>
      <div style={{ fontFamily:'var(--display)', fontSize:'4rem', fontWeight:900, color:'var(--gold)' }}>404</div>
      <h1 style={{ fontFamily:'var(--display)', fontSize:'1.5rem', fontWeight:700 }}>Page Not Found</h1>
      <p style={{ color:'var(--muted)', fontWeight:300 }}>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary">Go Home</Link>
    </div>
  );
}
