'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Policy, Tag } from '@/lib/types';
import { TagChip } from './TagChip';
import { Footer } from './Footer';

const CATS = ['Economic Policy','Governance Reform','Energy Policy','Health Policy','Infrastructure','Education Policy','Security & Defence','Trade & Commerce','Environment','Other'];
const YRS = ['2020','2021','2022','2023','2024','2025','2026'];

function avgRatings(r: Record<string,number>): number {
  const v = Object.values(r).filter(x => typeof x === 'number');
  return v.length ? v.reduce((a,b)=>a+b,0)/v.length : 0;
}

function MiniBar({ pct }: { pct: number }) {
  return (
    <div className="mini-bar">
      <div className="mini-bar-fill" style={{ width: `${pct*10}%` }} />
    </div>
  );
}

function PolicyCard({ p, tags }: { p: Policy; tags: Tag[] }) {
  const pre = p.pre_ratings ? avgRatings(p.pre_ratings as Record<string,number>) : 0;
  const post = p.post_ratings ? avgRatings(p.post_ratings as Record<string,number>) : 0;
  const yr = p.date ? new Date(p.date).getFullYear() : '';
  const hasBars = pre > 0 || post > 0;

  return (
    <Link href={`/policies/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="policy-card">
        <div className="card-eyebrow">
          <span className="card-cat">{p.category}</span>
          <span className="card-yr">{yr}</span>
        </div>
        <div className="card-title">{p.title}</div>
        {p.intro && <div className="card-intro">{p.intro}</div>}
        {p.tags?.length > 0 && (
          <div className="card-tags">
            {p.tags.slice(0,5).map(code => <TagChip key={code} code={code} tags={tags} />)}
          </div>
        )}
        {hasBars && (
          <div className="mini-bars">
            {pre > 0 && <MiniBar pct={pre} />}
            {post > 0 && <MiniBar pct={post} />}
          </div>
        )}
        <div className="card-foot">
          <span className="card-by">by <strong>{p.sponsor || 'Government'}</strong></span>
          <div className="card-counts">
            <span className={`outcome-badge ${p.outcome_status}`}>
              {p.outcome_status === 'positive' ? '✓' : p.outcome_status === 'negative' ? '✗' : '○'} {p.outcome_status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HomeClient({ policies, tags }: { policies: Policy[]; tags: Tag[] }) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('ALL');
  const [activeYr, setActiveYr] = useState('ALL');
  const [activeCat, setActiveCat] = useState('ALL');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return policies.filter(p => {
      if (q && !p.title.toLowerCase().includes(q) && !p.intro?.toLowerCase().includes(q) && !p.sponsor?.toLowerCase().includes(q)) return false;
      if (activeTag !== 'ALL' && !p.tags?.includes(activeTag)) return false;
      if (activeYr !== 'ALL' && (!p.date || !p.date.startsWith(activeYr))) return false;
      if (activeCat !== 'ALL' && p.category !== activeCat) return false;
      return true;
    });
  }, [policies, search, activeTag, activeYr, activeCat]);

  const totalComments = 0;
  const totalLikes = policies.reduce((a,p) => a + (p.likes||0), 0);

  return (
    <>
      <div className="hero">
        <h1>Decisions by those<br />in power. <em>On record.</em></h1>
        <p className="hero-sub">Public Profile tracks Ghana government policies, bills, and decisions from 2020 to today — rated, sourced, and open to public scrutiny.</p>
        <div className="hero-cta">
          <a className="yt-link" href="https://youtube.com/@updatedlyinc" target="_blank" rel="noopener">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
            Watch on Updatedely
          </a>
          <Link href="/about" className="btn-ghost">How this works</Link>
        </div>
        <div className="hero-search">
          <input
            type="text"
            className="hero-search-inp"
            placeholder="Search policies, figures, or decisions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="stats-row">
          <div className="stat-item"><span className="stat-num">{policies.length}</span><span className="stat-label">Policies</span></div>
          <div className="stat-item"><span className="stat-num">{totalComments}</span><span className="stat-label">Comments</span></div>
          <div className="stat-item"><span className="stat-num">{totalLikes}</span><span className="stat-label">Reactions</span></div>
          <div className="stat-item"><span className="stat-num">7</span><span className="stat-label">Years Tracked</span></div>
        </div>
      </div>

      <div className="grid-shell">
        <div className="filter-bar">
          <div className="chip-row">
            <span className="chip-label">Tag:</span>
            {['ALL','NPP','NDC','PEP','CORR','ADM','REPU','NCOM','CONT'].map(t => (
              <button key={t} className={`chip${activeTag===t?' active':''}`} onClick={() => setActiveTag(t)}>
                {t === 'ALL' ? 'All' : t === 'CORR' ? 'Corruption' : t === 'ADM' ? 'Misconduct' : t === 'REPU' ? 'Reputational' : t === 'NCOM' ? 'Non-Compliance' : t === 'CONT' ? 'Controversy' : t}
              </button>
            ))}
          </div>
          <div className="chip-row">
            <span className="chip-label">Year:</span>
            <button className={`chip${activeYr==='ALL'?' active':''}`} onClick={() => setActiveYr('ALL')}>All</button>
            {YRS.map(y => (
              <button key={y} className={`chip${activeYr===y?' active':''}`} onClick={() => setActiveYr(y)}>{y}</button>
            ))}
          </div>
          <div className="chip-row">
            <span className="chip-label">Type:</span>
            <button className={`cat-chip${activeCat==='ALL'?' active':''}`} onClick={() => setActiveCat('ALL')}>All</button>
            {CATS.map(c => (
              <button key={c} className={`cat-chip${activeCat===c?' active':''}`} onClick={() => setActiveCat(c)}>
                {c.replace(' Policy','').replace(' Reform','').replace(' & Defence','').replace(' & Commerce','')}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem 0', color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'.8rem' }}>
            No policies found.
          </div>
        ) : (
          <div className="policy-grid">
            {filtered.map(p => <PolicyCard key={p.id} p={p} tags={tags} />)}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
