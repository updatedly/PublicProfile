import Link from 'next/link'

export default function Header() {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      padding: '0 1.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(15,15,15,.96)',
      backdropFilter: 'blur(10px)',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{
          fontFamily: 'var(--display)',
          fontSize: '1.15rem',
          fontWeight: 900,
          color: 'var(--text)',
          letterSpacing: '.01em',
          userSelect: 'none',
        }}>
          Public <span style={{ color: 'var(--gold)' }}>Profile</span>
        </div>
      </Link>

      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="nav-link">Tracker</span>
        </Link>
        <Link href="/officials" style={{ textDecoration: 'none' }}>
          <span className="nav-link">Officials &amp; Institutions</span>
        </Link>
        <Link href="/about" style={{ textDecoration: 'none' }}>
          <span className="nav-link">About</span>
        </Link>
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '.62rem',
            letterSpacing: '.07em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            padding: '.3rem .7rem',
            border: '1px solid rgba(201,168,76,.3)',
            borderRadius: 'var(--radius)',
          }}>Admin</span>
        </Link>
      </nav>

      <style>{`
        .nav-link {
          font-family: var(--mono);
          font-size: .65rem;
          letter-spacing: .09em;
          text-transform: uppercase;
          color: var(--muted);
          transition: color .2s;
        }
        .nav-link:hover { color: var(--gold); }
        @media(max-width: 640px) {
          .nav-link { display: none; }
        }
      `}</style>
    </header>
  )
}
