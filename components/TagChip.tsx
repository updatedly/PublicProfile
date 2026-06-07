'use client';

import { Tag } from '@/lib/types';

interface TagChipProps {
  code: string;
  tags?: Tag[];
  size?: 'sm' | 'md';
}

// Default colors for core tags when DB data not available
const CORE_TAG_COLORS: Record<string, string> = {
  NPP: '#1d4ed8', NDC: '#15803d', PEP: '#7c3aed', COMP: '#0369a1',
  CORR: '#dc2626', ADM: '#d97706', REPU: '#db2777', CONT: '#9333ea', NCOM: '#ef4444',
};

export function TagChip({ code, tags, size = 'md' }: TagChipProps) {
  const tag = tags?.find(t => t.code === code);
  const color = tag?.color ?? CORE_TAG_COLORS[code] ?? '#6b7280';
  const label = tag?.label ?? code;

  return (
    <span
      className="tag-chip"
      style={{
        background: color + '22',
        color: color,
        border: `1px solid ${color}44`,
        fontSize: size === 'sm' ? '0.65rem' : '0.7rem',
      }}
      title={tag?.description || code}
    >
      {label}
    </span>
  );
}
