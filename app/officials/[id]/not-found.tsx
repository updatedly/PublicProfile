import Link from 'next/link';
export default function NotFound() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'70vh', gap:'1rem', textAlign:'center' }}>
      <div style={{ fontFamily:'var(--display)', fontSize:'3rem', fontWeight:900, color:'var(--gold)' }}>404</div>
      <h1 style={{ fontFamily:'var(--display)', fontSize:'1.4rem', fontWeight:700 }}>Profile Not Found</h1>
      <Link href="/officials" className="btn-primary">← Back to Officials</Link>
    </div>
  );
}
