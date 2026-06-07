'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Entity, Tag } from '@/lib/types';
import { TagChip } from './TagChip';

interface OfficialsListClientProps {
  entities: Entity[];
  tags: Tag[];
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export function OfficialsListClient({ entities, tags }: OfficialsListClientProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return entities.filter(e => {
      if (q && !e.name.toLowerCase().includes(q) && !e.role.toLowerCase().includes(q)) return false;
      if (typeFilter && e.type !== typeFilter) return false;
      if (tagFilter && !e.tags.includes(tagFilter)) return false;
      return true;
    });
  }, [entities, search, typeFilter, tagFilter]);

  return (
    <>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <input
          type="search"
          className="form-input"
          placeholder="Search by name or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 200px', maxWidth: '300px' }}
        />
        <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 'auto', flex: '0 0 150px' }}>
          <option value="">All Types</option>
          <option value="official">Officials</option>
          <option value="institution">Institutions</option>
        </select>
        <select className="form-select" value={tagFilter} onChange={e => setTagFilter(e.target.value)} style={{ width: 'auto', flex: '0 0 140px' }}>
          <option value="">All Tags</option>
          {tags.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
        </select>
        {(search || typeFilter || tagFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setTypeFilter(''); setTagFilter(''); }}>Clear ✕</button>
        )}
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1rem' }}>
        {filtered.length} {filtered.length === 1 ? 'profile' : 'profiles'}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-3)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
          <p>No profiles found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          {filtered.map(entity => {
            const primaryPhoto = entity.photos?.[0];
            const initials = getInitials(entity.name);
            return (
              <Link key={entity.id} href={`/officials/${entity.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                  {/* Avatar */}
                  <div style={{ flexShrink: 0 }}>
                    {primaryPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primaryPhoto}
                        alt={entity.name}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                        onError={e => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const sibling = target.nextElementSibling as HTMLElement;
                          if (sibling) sibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      background: 'var(--accent-dim)', border: '2px solid var(--accent-dim-2)',
                      display: primaryPhoto ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.25rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{entity.name}</h3>
                      <span className={`badge badge-${entity.type === 'official' ? 'published' : 'draft'}`} style={{ flexShrink: 0 }}>
                        {entity.type === 'official' ? '👤' : '🏛️'}
                      </span>
                    </div>
                    {entity.role && <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.375rem' }}>{entity.role}</p>}
                    {entity.party && <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{entity.party}</p>}
                    {entity.tags?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                        {entity.tags.slice(0, 3).map(code => <TagChip key={code} code={code} tags={tags} size="sm" />)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
