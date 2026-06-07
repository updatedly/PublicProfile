import type { PolicyFinance } from '@/lib/types';

interface FinanceBlockProps {
  finance: PolicyFinance;
}

interface FinanceItem {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}

export function FinanceBlock({ finance }: FinanceBlockProps) {
  const items: FinanceItem[] = [];

  if (finance.totalAmount) items.push({ icon: '💰', label: 'Total Amount', value: finance.totalAmount, highlight: true });
  if (finance.fundingSource) items.push({ icon: '🏦', label: 'Funding Source', value: finance.fundingSource });
  if (typeof finance.fromPublicPurse === 'boolean') items.push({
    icon: finance.fromPublicPurse ? '🇬🇭' : '🔗',
    label: 'From Public Purse',
    value: finance.fromPublicPurse ? 'Yes — Taxpayer Funded' : 'No',
    highlight: finance.fromPublicPurse,
  });
  if (finance.donorName) items.push({ icon: '🤝', label: 'Donor / Funder', value: finance.donorName });
  if (finance.loanTerms) items.push({ icon: '📋', label: 'Loan Terms', value: finance.loanTerms });
  if (finance.grantDetails) items.push({ icon: '🎁', label: 'Grant Details', value: finance.grantDetails });
  if (finance.disbursedAmount) items.push({ icon: '📤', label: 'Disbursed So Far', value: finance.disbursedAmount });

  if (!items.length && !finance.notes && !finance.budgetDocUrl) return null;

  return (
    <section>
      <div className="section-label">Finance & Accountability</div>

      {items.length > 0 && (
        <div className="finance-grid" style={{ marginBottom: finance.notes || finance.budgetDocUrl ? '1rem' : 0 }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="finance-card"
              style={item.highlight ? { borderColor: 'var(--accent-dim-2)', background: 'var(--accent-dim)' } : {}}
            >
              <div className="finance-card-icon">{item.icon}</div>
              <div className="finance-card-label">{item.label}</div>
              <div className="finance-card-value">{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Budget Doc */}
      {finance.hasBudgetDoc && finance.budgetDocUrl && (
        <a
          href={finance.budgetDocUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.875rem',
            background: 'var(--bg-3)',
            border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
            color: 'var(--accent)',
            textDecoration: 'none',
            marginBottom: '0.75rem',
          }}
        >
          📄 {finance.budgetDocLabel || 'Official Budget Document'} ↗
        </a>
      )}

      {/* Notes */}
      {finance.notes && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-2)',
          lineHeight: 1.6,
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem 1rem',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-3)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes: </span>
          {finance.notes}
        </p>
      )}
    </section>
  );
}
