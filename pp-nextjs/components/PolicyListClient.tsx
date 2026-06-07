'use client';

import { useState, useMemo } from 'react';
import type { Policy, Tag } from '@/lib/types';
import { PolicyCard } from './PolicyCard';
import { POLICY_CATEGORIES } from '@/lib/types';

interface PolicyListClientProps {
  initialPolicies: Policy[];
  tags: Tag[];
}

export function PolicyListClient({ initialPolicies, tags }: PolicyListClientProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return initialPolicies.filter(p => {
      if (q && !p.title.toLowerCase().includes(q) && !p.intro.toLowerCase().includes(q) && !p.sponsor.toLowerCase().includes(q)) return false;
      if (category && p.category !== category) return false;
      if (outcomeFilter && p.outcome_status !== outcomeFilter) return false;
      if (tagFilter && !p.tags.includes(tagFilter)) return false;
      return true;
    });
  }, [initialPolicies, search, category, outcomeFilter, tagFilter]);

  const hasFilters = search || category || outcomeFilter || tagFilter;

  return (
    <>
      {/* Search + filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        <input
          type="search"
          className="hero-search"
          placeholder="Search policies, sponsors…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '100%' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: 'auto', minWidth: '160px', flex: '1 1 auto', maxWidth: '220px' }}
          >
            <option value="">All Categories</option>
            {POLICY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="form-select"
            value={outcomeFilter}
            onChange={e => setOutcomeFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '140px', flex: '1 1 auto', maxWidth: '180px' }}
          >
            <option value="">All Outcomes</option>
            <option value="pending">Pending</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>

          <select
            className="form-select"
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '120px', flex: '1 1 auto', maxWidth: '160px' }}
          >
            <option value="">All Tags</option>
            {tags.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
          </select>

          {hasFilters && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setSearch(''); setCategory(''); setOutcomeFilter(''); setTagFilter(''); }}
            >
              Clear ✕
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1.25rem' }}>
        {filtered.length} {filtered.length === 1 ? 'policy' : 'policies'}{hasFilters ? ' matching filters' : ''}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-3)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
          <p style={{ fontSize: '1rem' }}>No policies found.</p>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem' }}
              onClick={() => { setSearch(''); setCategory(''); setOutcomeFilter(''); setTagFilter(''); }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
          gap: '1rem',
        }}>
          {filtered.map(p => <PolicyCard key={p.id} policy={p} tags={tags} />)}
        </div>
      )}
    </>
  );
}
