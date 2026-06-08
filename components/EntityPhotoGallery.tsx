'use client';
import { useState, useEffect, useCallback } from 'react';

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');
}

export function EntityPhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const valid = photos.filter(Boolean);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [err, setErr] = useState(false);

  const nav = useCallback((dir: number) => {
    setActive(i => (i + dir + valid.length) % valid.length);
  }, [valid.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') nav(1);
      if (e.key === 'ArrowLeft') nav(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, nav]);

  useEffect(() => { setErr(false); }, [active]);

  if (!valid.length) {
    return (
      <div className="profile-primary-initials">{initials(name)}</div>
    );
  }

  return (
    <>
      <div className="profile-primary-wrap">
        {err ? (
          <div className="profile-primary-initials">{initials(name)}</div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={valid[active]}
            alt={name}
            className="profile-primary-img"
            onClick={() => setLightbox(true)}
            onError={() => setErr(true)}
          />
        )}
      </div>
      {valid.length > 1 && (
        <div className="profile-gallery">
          {valid.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt={`${name} ${i+1}`}
              className={`profile-thumb${i===active?' active':''}`}
              onClick={() => { setActive(i); setErr(false); }}
              onError={e2 => { (e2.target as HTMLImageElement).style.display='none'; }}
            />
          ))}
        </div>
      )}

      {lightbox && (
        <div className="profile-photo-lightbox open" onClick={() => setLightbox(false)}>
          <button className="lightbox-close" onClick={() => setLightbox(false)}>×</button>
          {valid.length > 1 && (
            <>
              <button className="lightbox-nav prev" onClick={e => { e.stopPropagation(); nav(-1); }}>‹</button>
              <button className="lightbox-nav next" onClick={e => { e.stopPropagation(); nav(1); }}>›</button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={valid[active]} alt={name} onClick={e => e.stopPropagation()} />
          <div className="lightbox-caption">{active+1} / {valid.length}</div>
        </div>
      )}
    </>
  );
}
