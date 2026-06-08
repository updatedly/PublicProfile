'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Entity, Tag } from '@/lib/types';
import { TagChip } from './TagChip';
import { Footer } from './Footer';

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');
}

export function OfficialsClient({ entities, tags }: { entities: Entity[]; tags: Tag[] }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entities.filter(e => {
      if (q && !e.name.toLowerCase().includes(q) && !e.role?.toLowerCase().includes(q)) return false;
      if (typeFilter === 'official' && e.type !== 'official') return false;
      if (typeFilter === 'institution' && e.type !== 'institution') return false;
      return true;
    });
  }, [entities, search, typeFilter]);

  return (
    <>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'1.75rem' }}>
        <div style={{ borderBottom:'1px solid var(--border)', paddingBottom:'1.5rem', marginBottom:'1.5rem' }}>
          <h1 style={{ fontFamily:'var(--display)', fontSize:'clamp(1.6rem,4vw,2.5rem)', fontWeight:900, marginBottom:'.5rem' }}>
            Officials &amp; Institutions
          </h1>
          <p style={{ color:'var(--muted)', fontSize:'.88rem', fontWeight:300, marginBottom:'1rem' }}>
            Profiles of public officials and government institutions in Ghana.
          </p>
          <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap', alignItems:'center' }}>
            <input
              type="text"
              placeholder="Search by name or role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background:'var(--surface)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'var(--mono)', fontSize:'.75rem', padding:'.5rem .85rem', borderRadius:'var(--radius)', outline:'none', flex:'1', maxWidth:'320px' }}
            />
            {['ALL','official','institution'].map(t => (
              <button key={t} className={`chip${typeFilter===t?' active':''}`} onClick={() => setTypeFilter(t)}>
                {t === 'ALL' ? 'All' : t === 'official' ? 'Officials' : 'Institutions'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem 0', color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'.8rem' }}>
            No profiles found.
          </div>
        ) : (
          <div className="entity-grid">
            {filtered.map(e => {
              const photo = e.photos?.[0];
              return (
                <Link key={e.id} href={`/officials/${e.id}`} style={{ textDecoration:'none', color:'inherit' }}>
                  <div className="entity-card">
                    <div style={{ display:'flex', alignItems:'center', gap:'.85rem', marginBottom:'.75rem' }}>
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt={e.name} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}
                          onError={e2 => { (e2.target as HTMLImageElement).style.display='none'; }} />
                      ) : (
                        <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--gold-bg)', border:'1px solid rgba(201,168,76,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontWeight:900, color:'var(--gold)', fontSize:'1rem', flexShrink:0 }}>
                          {initials(e.name)}
                        </div>
                      )}
                      <div>
                        <div className="entity-name">{e.name}</div>
                        {e.role && <div className="entity-role">{e.role}</div>}
                      </div>
                    </div>
                    {e.tags?.length > 0 && (
                      <div className="card-tags">
                        {e.tags.slice(0,4).map(code => <TagChip key={code} code={code} tags={tags} />)}
                      </div>
                    )}
                    <div style={{ fontFamily:'var(--mono)', fontSize:'.55rem', color:'var(--muted2)', textTransform:'uppercase', letterSpacing:'.07em' }}>
                      {e.type === 'institution' ? '🏛 Institution' : '👤 Official'}{e.party ? ` · ${e.party}` : ''}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
