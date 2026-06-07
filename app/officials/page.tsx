import Link from 'next/link';
import type { Metadata } from 'next';
import { getEntities, getTags } from '@/lib/queries';
import { TagChip } from '@/components/TagChip';
import { OfficialsListClient } from '@/components/OfficialsListClient';

export const metadata: Metadata = {
  title: 'Officials & Institutions — Public Profile',
  description: 'Browse public officials and government institutions tracked by Public Profile Ghana.',
};

export const revalidate = 60;

export default async function OfficialsPage() {
  const [entities, tags] = await Promise.all([getEntities(), getTags()]);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 700, marginBottom: '0.5rem' }}>
          Officials & Institutions
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
          Profiles of public officials and government institutions operating in Ghana.
        </p>
      </div>

      <OfficialsListClient entities={entities} tags={tags} />
    </div>
  );
}
