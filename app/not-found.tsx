import Link from 'next/link'
export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', fontFamily:'var(--mono)' }}>
      <div style={{ fontSize:'3rem', opacity:.2 }}>404</div>
      <div style={{ fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.12em', color:'var(--muted)' }}>Page not found</div>
      <Link href="/" style={{ color:'var(--gold)', fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'.09em' }}>← Back to Tracker</Link>
    </div>
  )
}
