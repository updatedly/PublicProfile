import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPolicy, getTags, getComments, getRatings } from '@/lib/queries';
import { TagChip } from '@/components/TagChip';
import { FinanceBlock } from '@/components/FinanceBlock';
import { RatingForm } from '@/components/RatingForm';
import { CommentForm } from '@/components/CommentForm';
import { Footer } from '@/components/Footer';
import type { RatingDimensions } from '@/lib/types';

export const revalidate = 60;
interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getPolicy(id);
  if (!p) return { title: 'Not Found' };
  return { title: `${p.title} — Public Profile`, description: p.intro?.slice(0,160) };
}

const RATING_LABELS: Record<string,string> = {
  transparency:'Transparency', representation:'Representation', justification:'Justification',
  readiness:'Readiness', effectiveness:'Effectiveness', ux:'User Experience', equity:'Equity', cost:'Cost-Efficiency',
};

function scoreClass(v: number) {
  return v >= 7 ? 'high' : v >= 4 ? 'mid' : 'low';
}

function RatingCard({ label, ratings, className }: { label: string; ratings: Record<string,number>; className: string }) {
  const entries = Object.entries(ratings).filter(([,v]) => typeof v === 'number' && v !== null);
  if (!entries.length) return null;
  return (
    <div className="rating-card">
      <div className="rc-head">{label}</div>
      {entries.map(([k, v]) => (
        <div key={k} className="rc-row">
          <div className="rc-label-row">
            <span className="rc-label">{RATING_LABELS[k] ?? k}</span>
            <span className={`rc-score ${scoreClass(v)}`}>{v.toFixed(1)}</span>
          </div>
          <div className="rc-bar">
            <div className={`rc-fill ${className}`} style={{ width: `${v*10}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function fmtDate(d: string) {
  try { return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); } catch { return d; }
}

function parseTimeline(raw: string): { date: string; text: string }[] {
  return raw.split('\n').filter(Boolean).map(line => {
    const [date, ...rest] = line.split('|');
    return { date: date?.trim() ?? '', text: rest.join('|').trim() || date.trim() };
  });
}

function ChBody({ text }: { text: string }) {
  return (
    <div className="ch-body">
      {text.split('\n').filter(Boolean).map((p,i) => <p key={i}>{p}</p>)}
    </div>
  );
}

export default async function PolicyDetail({ params }: Props) {
  const { id } = await params;
  const [policy, tags, comments, ratings] = await Promise.all([
    getPolicy(id), getTags(), getComments(id), getRatings(id),
  ]);
  if (!policy) notFound();

  const pre = policy.pre_ratings as Record<string,number> ?? {};
  const post = policy.post_ratings as Record<string,number> ?? {};
  const tlItems = policy.timeline ? parseTimeline(policy.timeline) : [];

  const CHAPTERS = [
    { num: '01', title: 'Overview', body: policy.intro },
    { num: '02', title: 'Background', body: policy.background },
    { num: '03', title: 'Key Details', body: policy.keydetails },
    { num: '04', title: 'Structure & Mechanism', body: policy.structure },
    { num: '05', title: 'Outcome', body: policy.outcome },
  ].filter(c => c.body?.trim());

  return (
    <>
      <div className="detail-wrap fade-up">
        <Link href="/" className="detail-back">← Back to tracker</Link>
        <div className="detail-grid">
          {/* MAIN */}
          <div className="detail-main">
            <div className="detail-eyebrow">{policy.category}</div>
            <h1 className="detail-title">{policy.title}</h1>
            <div className="detail-meta">
              {policy.sponsor && <div className="meta-block"><span className="meta-label">Sponsor</span><span className="meta-value">{policy.sponsor}</span></div>}
              {policy.party && <div className="meta-block"><span className="meta-label">Party</span><span className="meta-value">{policy.party}</span></div>}
              {policy.date && <div className="meta-block"><span className="meta-label">Date</span><span className="meta-value">{fmtDate(policy.date)}</span></div>}
              <div className="meta-block">
                <span className="meta-label">Status</span>
                <span className={`outcome-badge ${policy.outcome_status}`}>
                  {policy.outcome_status === 'positive' ? '✓' : policy.outcome_status === 'negative' ? '✗' : '○'} {policy.outcome_status}
                </span>
              </div>
            </div>

            {policy.tags?.length > 0 && (
              <div className="card-tags" style={{ marginBottom:'1.5rem', gap:'.35rem', display:'flex', flexWrap:'wrap' }}>
                {policy.tags.map(code => <TagChip key={code} code={code} tags={tags} />)}
              </div>
            )}

            {/* Chapters */}
            <div>
              {CHAPTERS.map(ch => (
                <div key={ch.num} className="chapter">
                  <div className="ch-num">Chapter {ch.num}</div>
                  <div className="ch-title">{ch.title}</div>
                  <ChBody text={ch.body!} />
                </div>
              ))}

              {/* Timeline chapter */}
              {tlItems.length > 0 && (
                <div className="chapter">
                  <div className="ch-num">Timeline</div>
                  <div className="ch-title">Key Events</div>
                  <div className="tl">
                    {tlItems.map((item, i) => (
                      <div key={i} className="tl-item">
                        <div className="tl-date">{item.date}</div>
                        <div className="tl-dot" />
                        <div className="tl-text">{item.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Finance */}
              {policy.finance && Object.keys(policy.finance).length > 0 && (
                <div className="chapter">
                  <div className="ch-num">Finance</div>
                  <div className="ch-title">Financial Accountability</div>
                  <FinanceBlock finance={policy.finance} />
                </div>
              )}
            </div>

            {/* Refs */}
            {policy.refs?.length > 0 && (
              <div className="refs-section">
                <div style={{ fontFamily:'var(--mono)', fontSize:'.56rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--gold)', marginBottom:'.6rem' }}>
                  References
                </div>
                {policy.refs.map((ref, i) => (
                  <div key={i} className="ref-item">
                    <span className="ref-num">[{i+1}]</span>
                    <div>
                      <a href={ref.url} className="ref-link" target="_blank" rel="noopener">{ref.label}</a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comments */}
            <div className="comments-shell">
              <div className="comments-title">Discussion</div>
              <CommentForm policyId={policy.id} initialComments={comments} />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="detail-sidebar">
            {/* Ratings */}
            {Object.keys(pre).length > 0 && (
              <RatingCard label="Pre-Implementation Ratings" ratings={pre} className="pre-fill" />
            )}
            {Object.keys(post).length > 0 && (
              <RatingCard label="Post-Implementation Ratings" ratings={post} className="post-fill" />
            )}

            {/* Community ratings */}
            <RatingForm policyId={policy.id} existingRatings={ratings} />

            {/* Quick facts */}
            <div className="rating-card" style={{ marginTop:'.75rem' }}>
              <div className="rc-head">Quick Facts</div>
              {[
                ['Category', policy.category],
                ['Party', policy.party],
                ['Status', policy.status],
              ].filter(([,v])=>v).map(([k,v])=>(
                <div key={k as string} style={{ display:'flex', justifyContent:'space-between', padding:'.3rem 0', borderBottom:'1px solid var(--border)', fontSize:'.78rem' }}>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'.54rem', textTransform:'uppercase', color:'var(--muted)' }}>{k}</span>
                  <span style={{ fontWeight:600, fontSize:'.8rem' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
