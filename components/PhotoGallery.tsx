'use client';

import { useState, useEffect, useCallback } from 'react';

interface PhotoGalleryProps {
  photos: string[];
  name: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export function PhotoGallery({ photos, name }: PhotoGalleryProps) {
  const validPhotos = photos.filter(Boolean);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowRight') setActiveIdx(i => (i + 1) % validPhotos.length);
    if (e.key === 'ArrowLeft') setActiveIdx(i => (i - 1 + validPhotos.length) % validPhotos.length);
  }, [lightboxOpen, validPhotos.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => { setImgError(false); }, [activeIdx]);

  // No photos: initials avatar
  if (!validPhotos.length) {
    return (
      <div className="initials-avatar">
        {getInitials(name)}
      </div>
    );
  }

  return (
    <>
      {/* Main photo */}
      <div style={{ position: 'relative' }}>
        {imgError ? (
          <div className="initials-avatar">{getInitials(name)}</div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={validPhotos[activeIdx]}
            alt={`${name} photo ${activeIdx + 1}`}
            className="photo-main"
            onClick={() => setLightboxOpen(true)}
            onError={() => setImgError(true)}
          />
        )}
        {validPhotos.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '0.5rem',
            right: '0.5rem',
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            fontSize: '0.72rem',
            padding: '0.2em 0.5em',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
          }}>
            {activeIdx + 1}/{validPhotos.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {validPhotos.length > 1 && (
        <div className="photo-thumbnails">
          {validPhotos.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt={`${name} thumbnail ${i + 1}`}
              className={`photo-thumb ${i === activeIdx ? 'active' : ''}`}
              onClick={() => { setActiveIdx(i); setImgError(false); }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close">✕</button>

          {validPhotos.length > 1 && (
            <>
              <button
                className="lightbox-btn lightbox-btn-prev"
                onClick={e => { e.stopPropagation(); setActiveIdx(i => (i - 1 + validPhotos.length) % validPhotos.length); }}
                aria-label="Previous"
              >‹</button>
              <button
                className="lightbox-btn lightbox-btn-next"
                onClick={e => { e.stopPropagation(); setActiveIdx(i => (i + 1) % validPhotos.length); }}
                aria-label="Next"
              >›</button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={validPhotos[activeIdx]}
            alt={`${name} lightbox`}
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
