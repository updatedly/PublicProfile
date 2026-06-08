'use client';
import { useState, useEffect } from 'react';
import type { Rating } from '@/lib/types';
import { submitRating } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';

const DIMS = [
  { key:'transparency',    label:'Transparency' },
  { key:'representation',  label:'Representation' },
  { key:'justification',   label:'Justification' },
  { key:'readiness',       label:'Readiness' },
  { key:'effectiveness',   label:'Effectiveness' },
  { key:'ux',              label:'User Experience' },
  { key:'equity',          label:'Equity' },
  { key:'cost',            label:'Cost-Efficiency' },
];

function StarRow({ value, onChange }: { value: number; onChange:(v:number)=>void }) {
  const [hover, setHover] = useState(0);
  const stars = Math.round((hover||value)/2);
  return (
    <div style={{ display:'flex', gap:'.15rem' }}>
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem', padding:'.05rem', color: s<=stars ? 'var(--gold)' : 'var(--border2)', transition:'color .1s' }}
          onMouseEnter={() => setHover(s*2)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s*2)}
        >★</button>
      ))}
      {value>0 && <span style={{ fontFamily:'var(--mono)', fontSize:'.6rem', color:'var(--muted)', alignSelf:'center', marginLeft:'.25rem' }}>{value}/10</span>}
    </div>
  );
}

function avgDim(ratings: Rating[], dim: string): number|null {
  const vals = ratings.map(r => (r.ratings as Record<string,number>)[dim]).filter(v=>typeof v==='number');
  return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
}

export function RatingForm({ policyId, existingRatings }: { policyId:string; existingRatings:Rating[] }) {
  const [user, setUser] = useState<{id:string;email:string;name:string}|null>(null);
  const [checked, setChecked] = useState(false);
  const [mine, setMine] = useState<Record<string,number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data:{ user:u } } = await sb.auth.getUser();
      if (u) {
        setUser({ id:u.id, email:u.email!, name:u.user_metadata?.full_name??u.email! });
        const ex = existingRatings.find(r => r.user_email===u.email);
        if (ex) setMine(ex.ratings as Record<string,number>);
      }
      setChecked(true);
    })();
  }, [existingRatings]);

  const signIn = async () => {
    const sb = createClient();
    await sb.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.href } });
  };

  const submit = async () => {
    if (!user) return;
    setSaving(true); setError('');
    try {
      await submitRating({ policy_id: policyId, user_id: user.id, user_email: user.email, ratings: mine });
      setSaved(true);
    } catch (e:unknown) { setError(e instanceof Error ? e.message : 'Failed.'); }
    finally { setSaving(false); }
  };

  const count = existingRatings.length;

  return (
    <div className="rating-card">
      <div className="rc-head">
        Community Ratings {count>0 && <span style={{ color:'var(--muted2)' }}>· {count} {count===1?'rating':'ratings'}</span>}
      </div>

      {/* Community averages */}
      {count>0 && (
        <div style={{ marginBottom:'1rem' }}>
          {DIMS.map(({key,label}) => {
            const avg = avgDim(existingRatings, key);
            if (avg===null) return null;
            const cls = avg>=7?'high':avg>=4?'mid':'low';
            return (
              <div key={key} className="rc-row">
                <div className="rc-label-row">
                  <span className="rc-label">{label}</span>
                  <span className={`rc-score ${cls}`}>{avg.toFixed(1)}</span>
                </div>
                <div className="rc-bar">
                  <div className="rc-fill post-fill" style={{ width:`${avg*10}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!checked ? null : !user ? (
        <div style={{ textAlign:'center', padding:'.75rem 0' }}>
          <p style={{ fontSize:'.78rem', color:'var(--muted)', fontWeight:300, marginBottom:'.6rem' }}>
            Sign in to rate this policy.
          </p>
          <button onClick={signIn} className="btn-primary btn-sm">Sign in with Google</button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize:'.7rem', fontFamily:'var(--mono)', color:'var(--muted2)', marginBottom:'.75rem' }}>
            Rating as <span style={{ color:'var(--gold)' }}>{user.name}</span>
            {saved && <span style={{ marginLeft:'.75rem', color:'var(--green)' }}>✓ Saved</span>}
          </div>
          {DIMS.map(({key,label}) => (
            <div key={key} style={{ marginBottom:'.75rem' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'.58rem', textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text)', marginBottom:'.25rem' }}>
                {label}
              </div>
              <StarRow value={(mine[key]??0)} onChange={v => setMine(p=>({...p,[key]:v}))} />
            </div>
          ))}
          {error && <div style={{ color:'#e74c3c', fontSize:'.72rem', marginBottom:'.5rem', fontFamily:'var(--mono)' }}>{error}</div>}
          <button onClick={submit} disabled={saving||Object.keys(mine).length===0} className="btn-primary btn-sm" style={{ width:'100%', marginTop:'.5rem', justifyContent:'center' }}>
            {saving ? 'Saving…' : saved ? 'Update Rating' : 'Submit Rating'}
          </button>
        </div>
      )}
    </div>
  );
}
