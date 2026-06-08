import type { Tag } from '@/lib/types';

const CORE_COLORS: Record<string, string> = {
  NPP:'#6aafff', NDC:'#52d47e', PEP:'#f0a455', COMP:'#ff7777',
  CORR:'#ff9944', ADM:'#ff5555', REPU:'#d8d855', CONT:'#e077e0', NCOM:'#3dd4f0',
};

export function TagChip({ code, tags }: { code: string; tags?: Tag[] }) {
  const tag = tags?.find(t => t.code === code);
  const color = tag?.color ?? CORE_COLORS[code] ?? '#aaa';
  const label = tag?.label ?? code;
  return (
    <span className={`tag tag-${code}`} style={tag && !CORE_COLORS[code] ? {
      background: color + '30', color, border: `1px solid ${color}44`
    } : undefined} title={tag?.description}>
      {label}
    </span>
  );
}
