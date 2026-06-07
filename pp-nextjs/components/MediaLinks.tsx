import type { MediaLink } from '@/lib/types';

interface MediaLinksProps {
  links: MediaLink[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  article: { label: 'Article', icon: '📰', className: 'media-badge-article' },
  video: { label: 'Video', icon: '🎬', className: 'media-badge-video' },
  statement: { label: 'Statement', icon: '📢', className: 'media-badge-statement' },
  press_release: { label: 'Press Release', icon: '📄', className: 'media-badge-press_release' },
  other: { label: 'Other', icon: '🔗', className: 'media-badge-other' },
};

export function MediaLinks({ links }: MediaLinksProps) {
  if (!links?.length) return null;

  return (
    <section>
      <div className="section-label">Media & Press</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {links.map((link, i) => {
          const cfg = TYPE_CONFIG[link.type] ?? TYPE_CONFIG.other;
          return (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                padding: '0.875rem',
                background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                transition: 'border-color var(--transition), background var(--transition)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-3)';
              }}
            >
              <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '0.1rem' }}>{cfg.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${cfg.className}`}>{cfg.label}</span>
                  {link.source && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                      {link.source}
                    </span>
                  )}
                  {link.date && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                      {new Date(link.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {link.title} ↗
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
