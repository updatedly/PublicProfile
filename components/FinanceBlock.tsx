import type { PolicyFinance } from '@/lib/types';

export function FinanceBlock({ finance }: { finance: PolicyFinance }) {
  const cards = [
    finance.totalAmount     && { icon:'💰', label:'Total Amount',    value: finance.totalAmount },
    finance.fundingSource   && { icon:'🏦', label:'Funding Source',  value: finance.fundingSource },
    finance.disbursedAmount && { icon:'📤', label:'Disbursed So Far',value: finance.disbursedAmount },
    finance.donorName       && { icon:'🤝', label:'Donor / Funder',  value: finance.donorName },
    finance.loanTerms       && { icon:'📋', label:'Loan Terms',      value: finance.loanTerms },
    finance.grantDetails    && { icon:'🎁', label:'Grant Details',   value: finance.grantDetails },
    typeof finance.fromPublicPurse === 'boolean' && {
      icon: finance.fromPublicPurse ? '🇬🇭' : '🔗',
      label:'Public Purse',
      value: finance.fromPublicPurse ? 'Yes — Taxpayer Funded' : 'No',
    },
  ].filter(Boolean) as { icon:string; label:string; value:string }[];

  if (!cards.length && !finance.notes && !finance.budgetDocUrl) return null;

  return (
    <div>
      {cards.length > 0 && (
        <div className="finance-source-cards">
          {cards.map((c,i) => (
            <div key={i} className="finance-source-card">
              <div className="finance-source-card-icon">{c.icon}</div>
              <div className="finance-source-card-label">{c.label}</div>
              <div className="finance-source-card-value">{c.value}</div>
            </div>
          ))}
        </div>
      )}
      {finance.hasBudgetDoc && finance.budgetDocUrl && (
        <div className="finance-doc-card">
          <div>
            <div className="finance-doc-title">📄 {finance.budgetDocLabel || 'Official Budget Document'}</div>
            <a href={finance.budgetDocUrl} className="finance-doc-url" target="_blank" rel="noopener">
              {finance.budgetDocUrl}
            </a>
          </div>
        </div>
      )}
      {finance.notes && (
        <p style={{ fontSize:'.82rem', color:'var(--muted)', lineHeight:1.65, fontWeight:300, marginTop:'.75rem' }}>
          {finance.notes}
        </p>
      )}
    </div>
  );
}
