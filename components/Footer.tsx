import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-2)',
      borderTop: '1px solid var(--border)',
      padding: '2rem 0',
      marginTop: '4rem',
    }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{
              background: 'var(--accent)',
              color: '#0a0a0b',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '0.7rem',
              padding: '0.2em 0.45em',
              borderRadius: '3px',
            }}>PP</span>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>Public Profile</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', maxWidth: '300px' }}>
            An Updatedly initiative tracking government policies and public officials in Ghana.
          </p>
        </div>

        <nav style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {[['/', 'Policies'], ['/officials', 'Officials'], ['/about', 'About'], ['/admin', 'Admin']].map(([href, label]) => (
            <Link key={href} href={href} style={{ color: 'var(--text-3)', fontSize: '0.85rem', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </nav>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
          © {new Date().getFullYear()} Updatedly. For informational purposes.
        </p>
      </div>
    </footer>
  );
}
