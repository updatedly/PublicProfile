export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '1.5rem 1.75rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: '1rem',
            fontWeight: 900,
            color: 'var(--text)',
            marginBottom: '.25rem',
          }}>
            Public <span style={{ color: 'var(--gold)' }}>Profile</span>
          </div>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '.56rem',
            color: 'var(--muted2)',
            textTransform: 'uppercase',
            letterSpacing: '.06em',
          }}>
            © 2024–2026 · An Updatedly Initiative
          </div>
        </div>

        <a
          href="https://youtube.com/@updatedlyinc"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.45rem',
            background: 'rgba(255,0,0,.12)',
            border: '1px solid rgba(255,0,0,.2)',
            color: '#ff6b6b',
            fontFamily: 'var(--mono)',
            fontSize: '.6rem',
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            padding: '.35rem .85rem',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            transition: 'background .2s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
          </svg>
          Created by Updatedly
        </a>
      </div>
    </footer>
  )
}
