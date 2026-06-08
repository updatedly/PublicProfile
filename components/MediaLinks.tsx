import type { MediaLink } from '@/lib/types';

const TYPE_MAP: Record<string,string> = {
  article:'article', video:'video', statement:'statement', press_release:'press', other:'other',
};

export function MediaLinks({ links }: { links: MediaLink[] }) {
  if (!links?.length) return null;
  return (
    <div>
      <div style={{ fontFamily:'var(--mono)', fontSize:'.56rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--gold)', marginBottom:'.6rem' }}>
        Media &amp; Press
      </div>
      <div className="media-links-list">
        {links.map((link, i) => (
          <div key={i} className="media-link-item">
            <span className={`media-link-type-badge ${TYPE_MAP[link.type] ?? 'other'}`}>
              {link.type.replace('_',' ')}
            </span>
            <div className="media-link-body" style={{ flex:1, minWidth:0 }}>
              <div className="media-link-title">{link.title}</div>
              <div className="media-link-meta">
                {link.source}{link.source && link.date ? ' · ' : ''}{link.date}
              </div>
              {link.url && (
                <a href={link.url} className="media-link-url" target="_blank" rel="noopener">
                  {link.url}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
