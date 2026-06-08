'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Policy, Entity, Tag, MediaLink, PolicyFinance, PolicyRef, EntityUpdate } from '@/lib/types';
import { POLICY_CATEGORIES, FUNDING_SOURCES, MEDIA_LINK_TYPES, CORE_TAG_CODES } from '@/lib/types';

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
const ANTH_KEY  = process.env.NEXT_PUBLIC_ANTHROPIC_KEY;
const SUPA_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPA_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type Tab = 'hub'|'policies'|'entities'|'tags'|'auto'|'manual'|'entity-form';

// ─── API helpers ───────────────────────────────────────────────
async function db(table: string, method: string, body?: unknown, id?: string) {
  const url = `${SUPA_URL}/rest/v1/${table}${id?`?id=eq.${id}`:''}`;
  const res = await fetch(url, {
    method,
    headers: { apikey: SUPA_KEY, Authorization:`Bearer ${SUPA_KEY}`, 'Content-Type':'application/json', Prefer:'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function dbList(table: string, order: string) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?order=${order}`, {
    headers: { apikey: SUPA_KEY, Authorization:`Bearer ${SUPA_KEY}` },
  });
  return res.json();
}

// ─── Blank objects ─────────────────────────────────────────────
const blankPolicy = (): Partial<Policy> => ({ title:'', category:'', date:null, sponsor:'', party:'', tags:[], status:'draft', intro:'', background:'', keydetails:'', timeline:'', structure:'', outcome:'', outcome_status:'pending', pre_ratings:{}, post_ratings:{}, finance:{}, refs:[], likes:0 });
const blankEntity = (): Partial<Entity> => ({ type:'official', status:'draft', name:'', role:'', party:'', tenure:'', tags:[], bio:'', background:'', timeline:'', photos:[], media_links:[], linked_policies:[], updates:[], budget:'', website:'' });
const blankTag    = (): Partial<Tag>   => ({ code:'', label:'', description:'', color:'#c9a84c', is_core:false });

// ─── Field components ──────────────────────────────────────────
function FL({ label, children }: { label:string; children:React.ReactNode }) {
  return <div style={{ marginBottom:'.75rem' }}><label className="field-label">{label}</label>{children}</div>;
}

function TagSelector({ value, onChange, allTags }: { value:string[]; onChange:(v:string[])=>void; allTags:Tag[] }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem' }}>
      {allTags.map(t => {
        const on = value.includes(t.code);
        return (
          <button key={t.code} type="button" onClick={() => onChange(on ? value.filter(c=>c!==t.code) : [...value,t.code])}
            style={{ fontFamily:'var(--mono)', fontSize:'.54rem', letterSpacing:'.07em', textTransform:'uppercase', padding:'.18rem .48rem', borderRadius:'var(--radius)', cursor:'pointer', border:`2px solid ${on?t.color:'var(--border2)'}`, background:on?t.color+'22':'var(--surface2)', color:on?t.color:'var(--muted)', minHeight:28 }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function RatingSliders({ label, value, onChange }: { label:string; value:Record<string,number>; onChange:(v:Record<string,number>)=>void }) {
  const keys = ['transparency','representation','justification','readiness','effectiveness','ux','equity','cost'];
  const labels: Record<string,string> = { transparency:'Transparency', representation:'Representation', justification:'Justification', readiness:'Readiness', effectiveness:'Effectiveness', ux:'User Experience', equity:'Equity', cost:'Cost-Efficiency' };
  return (
    <div style={{ marginBottom:'.75rem' }}>
      <div className="field-label">{label}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'.5rem' }}>
        {keys.map(k => (
          <div key={k}>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:'.55rem', color:'var(--muted)', marginBottom:'.2rem' }}>
              <span>{labels[k]}</span><span style={{ color:'var(--gold)' }}>{(value[k]??0).toFixed(1)}</span>
            </div>
            <input type="range" min={0} max={10} step={0.5} value={value[k]??0}
              onChange={e => onChange({...value,[k]:parseFloat(e.target.value)})}
              style={{ width:'100%', accentColor:'var(--gold)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RefsEditor({ value, onChange }: { value:PolicyRef[]; onChange:(v:PolicyRef[])=>void }) {
  return (
    <div style={{ marginBottom:'.75rem' }}>
      <div className="field-label">References</div>
      {value.map((r,i) => (
        <div key={i} style={{ display:'flex', gap:'.4rem', marginBottom:'.35rem', alignItems:'center' }}>
          <input className="field-input" placeholder="Label" value={r.label} style={{ flex:1 }} onChange={e => { const n=[...value]; n[i]={...n[i],label:e.target.value}; onChange(n); }} />
          <input className="field-input" placeholder="URL" value={r.url} style={{ flex:2 }} onChange={e => { const n=[...value]; n[i]={...n[i],url:e.target.value}; onChange(n); }} />
          <button className="btn-danger btn-sm" onClick={() => onChange(value.filter((_,j)=>j!==i))}>✕</button>
        </div>
      ))}
      <button className="btn-ghost btn-sm" onClick={() => onChange([...value,{label:'',url:''}])}>+ Add Ref</button>
    </div>
  );
}

function FinanceEditor({ value, onChange }: { value:PolicyFinance; onChange:(v:PolicyFinance)=>void }) {
  const u = (k:keyof PolicyFinance, v:unknown) => onChange({...value,[k]:v});
  return (
    <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', padding:'.85rem', marginBottom:'.75rem' }}>
      <div className="field-label" style={{ color:'var(--gold)', marginBottom:'.6rem' }}>Finance & Accountability</div>
      <div className="field-row" style={{ marginBottom:'.5rem' }}>
        <FL label="Total Amount"><input className="field-input" value={value.totalAmount??''} onChange={e=>u('totalAmount',e.target.value)} placeholder="e.g. GHS 2.4bn" /></FL>
        <FL label="Funding Source">
          <select className="field-select" value={value.fundingSource??''} onChange={e=>u('fundingSource',e.target.value)}>
            <option value="">Select…</option>
            {FUNDING_SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </FL>
      </div>
      <div className="field-row" style={{ marginBottom:'.5rem' }}>
        <FL label="Amount Disbursed"><input className="field-input" value={value.disbursedAmount??''} onChange={e=>u('disbursedAmount',e.target.value)} /></FL>
        <FL label="Donor / Funder"><input className="field-input" value={value.donorName??''} onChange={e=>u('donorName',e.target.value)} /></FL>
      </div>
      <div className="field-row" style={{ marginBottom:'.5rem' }}>
        <FL label="Loan Terms"><input className="field-input" value={value.loanTerms??''} onChange={e=>u('loanTerms',e.target.value)} /></FL>
        <FL label="Grant Details"><input className="field-input" value={value.grantDetails??''} onChange={e=>u('grantDetails',e.target.value)} /></FL>
      </div>
      <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', marginBottom:'.5rem' }}>
        <label style={{ display:'flex', alignItems:'center', gap:'.4rem', cursor:'pointer', fontFamily:'var(--mono)', fontSize:'.65rem', color:'var(--muted)' }}>
          <input type="checkbox" checked={!!value.fromPublicPurse} onChange={e=>u('fromPublicPurse',e.target.checked)} style={{ accentColor:'var(--gold)' }} />
          From Public Purse?
        </label>
        <label style={{ display:'flex', alignItems:'center', gap:'.4rem', cursor:'pointer', fontFamily:'var(--mono)', fontSize:'.65rem', color:'var(--muted)' }}>
          <input type="checkbox" checked={!!value.hasBudgetDoc} onChange={e=>u('hasBudgetDoc',e.target.checked)} style={{ accentColor:'var(--gold)' }} />
          Budget Doc Available?
        </label>
      </div>
      {value.hasBudgetDoc && (
        <div className="field-row" style={{ marginBottom:'.5rem' }}>
          <FL label="Doc Label"><input className="field-input" value={value.budgetDocLabel??''} onChange={e=>u('budgetDocLabel',e.target.value)} /></FL>
          <FL label="Doc URL"><input className="field-input" value={value.budgetDocUrl??''} onChange={e=>u('budgetDocUrl',e.target.value)} placeholder="https://…" /></FL>
        </div>
      )}
      <FL label="Finance Notes"><textarea className="field-textarea" rows={2} value={value.notes??''} onChange={e=>u('notes',e.target.value)} /></FL>
    </div>
  );
}

function MediaLinksEditor({ value, onChange }: { value:MediaLink[]; onChange:(v:MediaLink[])=>void }) {
  return (
    <div style={{ marginBottom:'.75rem' }}>
      <div className="field-label">Media & Press Links</div>
      {value.map((l,i) => (
        <div key={i} style={{ background:'var(--surface2)', border:'1px solid var(--border)', padding:'.6rem', marginBottom:'.4rem' }}>
          <div style={{ display:'flex', gap:'.4rem', marginBottom:'.35rem', flexWrap:'wrap' }}>
            <select className="field-select" value={l.type} style={{ flex:'0 0 130px' }} onChange={e=>{const n=[...value];n[i]={...n[i],type:e.target.value as MediaLink['type']};onChange(n);}}>
              {MEDIA_LINK_TYPES.map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}
            </select>
            <input className="field-input" placeholder="Title" value={l.title} style={{ flex:2, minWidth:120 }} onChange={e=>{const n=[...value];n[i]={...n[i],title:e.target.value};onChange(n);}} />
            <button className="btn-danger btn-sm" onClick={()=>onChange(value.filter((_,j)=>j!==i))}>✕</button>
          </div>
          <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
            <input className="field-input" placeholder="Source" value={l.source} style={{ flex:1, minWidth:100 }} onChange={e=>{const n=[...value];n[i]={...n[i],source:e.target.value};onChange(n);}} />
            <input type="date" className="field-input" value={l.date} style={{ flex:'0 0 140px' }} onChange={e=>{const n=[...value];n[i]={...n[i],date:e.target.value};onChange(n);}} />
            <input className="field-input" placeholder="URL" value={l.url} style={{ flex:3, minWidth:160 }} onChange={e=>{const n=[...value];n[i]={...n[i],url:e.target.value};onChange(n);}} />
          </div>
        </div>
      ))}
      <button className="btn-ghost btn-sm" onClick={()=>onChange([...value,{type:'article',title:'',source:'',date:'',url:''}])}>+ Add Media Link</button>
    </div>
  );
}

function PhotosEditor({ value, onChange }: { value:string[]; onChange:(v:string[])=>void }) {
  return (
    <div style={{ marginBottom:'.75rem' }}>
      <div className="field-label">Photo URLs</div>
      {value.map((url,i) => (
        <div key={i} className="photo-url-row" style={{ display:'flex', gap:'.4rem', marginBottom:'.35rem', alignItems:'center' }}>
          {url && <img src={url} alt="" style={{ width:36, height:36, objectFit:'cover', borderRadius:'var(--radius)', flexShrink:0 }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />}
          <input className="field-input" placeholder="https://…" value={url} style={{ flex:1 }} onChange={e=>{const n=[...value];n[i]=e.target.value;onChange(n);}} />
          <button className="btn-danger btn-sm" onClick={()=>onChange(value.filter((_,j)=>j!==i))}>✕</button>
        </div>
      ))}
      <button className="btn-ghost btn-sm" onClick={()=>onChange([...value,''])}>+ Add Photo</button>
    </div>
  );
}

function UpdatesEditor({ value, onChange }: { value:EntityUpdate[]; onChange:(v:EntityUpdate[])=>void }) {
  return (
    <div style={{ marginBottom:'.75rem' }}>
      <div className="field-label">Updates</div>
      {value.map((u,i) => (
        <div key={i} style={{ display:'flex', gap:'.4rem', marginBottom:'.35rem', alignItems:'flex-start' }}>
          <input type="date" className="field-input" value={u.date} style={{ flex:'0 0 140px' }} onChange={e=>{const n=[...value];n[i]={...n[i],date:e.target.value};onChange(n);}} />
          <textarea className="field-textarea" rows={2} value={u.text} style={{ flex:1, minHeight:60 }} onChange={e=>{const n=[...value];n[i]={...n[i],text:e.target.value};onChange(n);}} />
          <button className="btn-danger btn-sm" onClick={()=>onChange(value.filter((_,j)=>j!==i))}>✕</button>
        </div>
      ))}
      <button className="btn-ghost btn-sm" onClick={()=>onChange([{date:new Date().toISOString().slice(0,10),text:''},...value])}>+ Add Update</button>
    </div>
  );
}

// ─── Policy Form ───────────────────────────────────────────────
function PolicyForm({ initial, tags, policies, onSaved, onCancel }: { initial:Partial<Policy>; tags:Tag[]; policies:Policy[]; onSaved:()=>void; onCancel:()=>void }) {
  const [f, setF] = useState<Partial<Policy>>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const u = (k:keyof Policy, v:unknown) => setF(p=>({...p,[k]:v}));

  const save = async (status?: string) => {
    if (!f.title?.trim()) { setErr('Title required.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = status ? {...f,status} : f;
      if (payload.id) await db('policies','PATCH',payload,payload.id);
      else await db('policies','POST',payload);
      onSaved();
    } catch(e:unknown) { setErr(e instanceof Error?e.message:'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'.5rem' }}>
        <h2 style={{ fontFamily:'var(--display)', fontSize:'1.25rem', fontWeight:700 }}>{f.id?'Edit Policy':'New Policy'}</h2>
        <div style={{ display:'flex', gap:'.5rem' }}>
          <button onClick={onCancel} className="btn-ghost btn-sm">Cancel</button>
          <button onClick={()=>save('draft')} disabled={saving} className="btn-ghost btn-sm">Save Draft</button>
          <button onClick={()=>save('published')} disabled={saving} className="btn-primary btn-sm">Publish</button>
        </div>
      </div>
      {err && <div className="status-box err" style={{ marginBottom:'.75rem' }}>{err}</div>}

      <div className="section-sep" style={{ marginTop:0 }}>Core Details</div>
      <FL label="Title *"><input className="field-input" value={f.title??''} onChange={e=>u('title',e.target.value)} /></FL>
      <div className="field-row">
        <FL label="Category">
          <select className="field-select" value={f.category??''} onChange={e=>u('category',e.target.value)}>
            <option value="">Select…</option>
            {POLICY_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </FL>
        <FL label="Date"><input type="date" className="field-input" value={f.date??''} onChange={e=>u('date',e.target.value||null)} /></FL>
      </div>
      <div className="field-row">
        <FL label="Sponsor"><input className="field-input" value={f.sponsor??''} onChange={e=>u('sponsor',e.target.value)} /></FL>
        <FL label="Party"><input className="field-input" value={f.party??''} onChange={e=>u('party',e.target.value)} /></FL>
      </div>
      <div className="field-row">
        <FL label="Status">
          <select className="field-select" value={f.status??'draft'} onChange={e=>u('status',e.target.value)}>
            <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
          </select>
        </FL>
        <FL label="Outcome">
          <select className="field-select" value={f.outcome_status??'pending'} onChange={e=>u('outcome_status',e.target.value)}>
            <option value="pending">Pending</option><option value="positive">Positive</option><option value="negative">Negative</option>
          </select>
        </FL>
      </div>
      <FL label="Tags"><TagSelector value={f.tags??[]} onChange={v=>u('tags',v)} allTags={tags} /></FL>

      <div className="section-sep">Content</div>
      {(['intro','background','keydetails','timeline','structure','outcome'] as const).map(field=>(
        <FL key={field} label={field.charAt(0).toUpperCase()+field.slice(1)}>
          <textarea className="field-textarea" rows={4} value={(f as Record<string,unknown>)[field] as string??''} onChange={e=>u(field,e.target.value)} />
        </FL>
      ))}

      <div className="section-sep">Finance</div>
      <FinanceEditor value={(f.finance??{}) as PolicyFinance} onChange={v=>u('finance',v)} />

      <div className="section-sep">Ratings</div>
      <RatingSliders label="Pre-Implementation" value={(f.pre_ratings??{}) as Record<string,number>} onChange={v=>u('pre_ratings',v)} />
      <RatingSliders label="Post-Implementation" value={(f.post_ratings??{}) as Record<string,number>} onChange={v=>u('post_ratings',v)} />

      <div className="section-sep">References</div>
      <RefsEditor value={f.refs??[]} onChange={v=>u('refs',v)} />

      <div style={{ display:'flex', gap:'.5rem', justifyContent:'flex-end', marginTop:'1.25rem' }}>
        <button onClick={onCancel} className="btn-ghost btn-sm">Cancel</button>
        <button onClick={()=>save('draft')} disabled={saving} className="btn-ghost btn-sm">Save Draft</button>
        <button onClick={()=>save('published')} disabled={saving} className="btn-primary">{saving?'Saving…':f.id?'Update':'Publish'}</button>
      </div>
    </div>
  );
}

// ─── Entity Form ───────────────────────────────────────────────
function EntityForm({ initial, tags, policies, onSaved, onCancel }: { initial:Partial<Entity>; tags:Tag[]; policies:Policy[]; onSaved:()=>void; onCancel:()=>void }) {
  const [f, setF] = useState<Partial<Entity>>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const u = (k:keyof Entity, v:unknown) => setF(p=>({...p,[k]:v}));

  const save = async () => {
    if (!f.name?.trim()) { setErr('Name required.'); return; }
    setSaving(true); setErr('');
    try {
      if (f.id) await db('entities','PATCH',f,f.id);
      else await db('entities','POST',f);
      onSaved();
    } catch(e:unknown) { setErr(e instanceof Error?e.message:'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'.5rem' }}>
        <h2 style={{ fontFamily:'var(--display)', fontSize:'1.25rem', fontWeight:700 }}>{f.id?'Edit Entity':'New Entity'}</h2>
        <div style={{ display:'flex', gap:'.5rem' }}>
          <button onClick={onCancel} className="btn-ghost btn-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary btn-sm">{saving?'Saving…':'Save'}</button>
        </div>
      </div>
      {err && <div className="status-box err" style={{ marginBottom:'.75rem' }}>{err}</div>}

      <div className="section-sep" style={{ marginTop:0 }}>Core Details</div>
      <FL label="Name *"><input className="field-input" value={f.name??''} onChange={e=>u('name',e.target.value)} /></FL>
      <div className="field-row">
        <FL label="Type">
          <select className="field-select" value={f.type??'official'} onChange={e=>u('type',e.target.value)}>
            <option value="official">Official</option><option value="institution">Institution</option>
          </select>
        </FL>
        <FL label="Status">
          <select className="field-select" value={f.status??'draft'} onChange={e=>u('status',e.target.value)}>
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </FL>
      </div>
      <div className="field-row">
        <FL label="Role / Title"><input className="field-input" value={f.role??''} onChange={e=>u('role',e.target.value)} /></FL>
        <FL label="Party"><input className="field-input" value={f.party??''} onChange={e=>u('party',e.target.value)} /></FL>
      </div>
      <div className="field-row">
        <FL label="Tenure"><input className="field-input" placeholder="e.g. Jan 2017 – Jan 2021" value={f.tenure??''} onChange={e=>u('tenure',e.target.value)} /></FL>
        <FL label="Website"><input className="field-input" placeholder="https://…" value={f.website??''} onChange={e=>u('website',e.target.value)} /></FL>
      </div>
      <FL label="Budget Doc URL"><input className="field-input" placeholder="https://…" value={f.budget??''} onChange={e=>u('budget',e.target.value)} /></FL>
      <FL label="Tags"><TagSelector value={f.tags??[]} onChange={v=>u('tags',v)} allTags={tags} /></FL>

      <div className="section-sep">Photos</div>
      <PhotosEditor value={f.photos??[]} onChange={v=>u('photos',v)} />

      <div className="section-sep">Content</div>
      {(['bio','background','timeline'] as const).map(field=>(
        <FL key={field} label={field.charAt(0).toUpperCase()+field.slice(1)}>
          <textarea className="field-textarea" rows={4} value={(f as Record<string,unknown>)[field] as string??''} onChange={e=>u(field,e.target.value)} />
        </FL>
      ))}

      <div className="section-sep">Updates</div>
      <UpdatesEditor value={f.updates??[]} onChange={v=>u('updates',v)} />

      <div className="section-sep">Media Links</div>
      <MediaLinksEditor value={f.media_links??[]} onChange={v=>u('media_links',v)} />

      <div className="section-sep">Linked Policies</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'.3rem', maxHeight:200, overflowY:'auto', padding:'.25rem' }}>
        {policies.map(p => (
          <label key={p.id} style={{ display:'flex', alignItems:'center', gap:'.5rem', cursor:'pointer', fontSize:'.82rem' }}>
            <input type="checkbox" checked={(f.linked_policies??[]).includes(p.id)} style={{ accentColor:'var(--gold)' }}
              onChange={e => { const prev=f.linked_policies??[]; u('linked_policies', e.target.checked?[...prev,p.id]:prev.filter(x=>x!==p.id)); }} />
            {p.title}
          </label>
        ))}
      </div>

      <div style={{ display:'flex', gap:'.5rem', justifyContent:'flex-end', marginTop:'1.25rem' }}>
        <button onClick={onCancel} className="btn-ghost btn-sm">Cancel</button>
        <button onClick={save} disabled={saving} className="btn-primary">{saving?'Saving…':f.id?'Update':'Create'}</button>
      </div>
    </div>
  );
}

// ─── Tag Manager ───────────────────────────────────────────────
function TagManager({ tags, onRefresh }: { tags:Tag[]; onRefresh:()=>void }) {
  const [editing, setEditing] = useState<Partial<Tag>|null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    if (!editing?.code?.trim()||!editing?.label?.trim()) { setErr('Code and label required.'); return; }
    setSaving(true); setErr('');
    try {
      if (editing.id) await db('tags','PATCH',editing,editing.id);
      else await db('tags','POST',{...editing,is_core:false});
      setEditing(null); onRefresh();
    } catch(e:unknown) { setErr(e instanceof Error?e.message:'Failed.'); }
    finally { setSaving(false); }
  };

  const del = async (tag:Tag) => {
    if (tag.is_core) { alert('Core tags cannot be deleted.'); return; }
    if (!confirm(`Delete "${tag.label}"?`)) return;
    await db('tags','DELETE',undefined,tag.id);
    onRefresh();
  };

  const COLORS = ['#6aafff','#52d47e','#f0a455','#ff7777','#ff9944','#ff5555','#d8d855','#e077e0','#3dd4f0','#c9a84c','#aaaaaa'];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <h2 style={{ fontFamily:'var(--display)', fontSize:'1.2rem', fontWeight:700 }}>Tag Manager</h2>
        {!editing && <button onClick={()=>setEditing(blankTag())} className="btn-primary btn-sm">+ New Tag</button>}
      </div>

      {editing && (
        <div style={{ background:'var(--gold-bg)', border:'1px solid rgba(201,168,76,.25)', padding:'.85rem', marginBottom:'1rem' }}>
          {err && <div className="status-box err" style={{ marginBottom:'.5rem' }}>{err}</div>}
          <div className="field-row" style={{ marginBottom:'.5rem' }}>
            <FL label="Code (short)">
              <input className="field-input" placeholder="FRAUD" value={editing.code??''} disabled={!!editing.is_core}
                onChange={e=>setEditing(p=>({...p!,code:e.target.value.toUpperCase().slice(0,8)}))} />
            </FL>
            <FL label="Display Label">
              <input className="field-input" placeholder="Fraud" value={editing.label??''} onChange={e=>setEditing(p=>({...p!,label:e.target.value}))} />
            </FL>
          </div>
          <FL label="Description">
            <input className="field-input" placeholder="Brief description…" value={editing.description??''} onChange={e=>setEditing(p=>({...p!,description:e.target.value}))} />
          </FL>
          <FL label="Colour">
            <div className="color-picker-row" style={{ display:'flex', gap:'.3rem', flexWrap:'wrap', alignItems:'center' }}>
              {COLORS.map(c => (
                <div key={c} onClick={()=>setEditing(p=>({...p!,color:c}))}
                  style={{ width:18, height:18, borderRadius:'50%', background:c, cursor:'pointer', border:`2px solid ${editing.color===c?'var(--text)':'transparent'}`, transition:'border-color .12s' }} />
              ))}
              <input type="color" value={editing.color??'#c9a84c'} onChange={e=>setEditing(p=>({...p!,color:e.target.value}))}
                style={{ width:28, height:28, borderRadius:'50%', border:'none', cursor:'pointer', background:'none' }} />
            </div>
          </FL>
          <div style={{ display:'flex', gap:'.5rem' }}>
            <button onClick={()=>setEditing(null)} className="btn-ghost btn-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-primary btn-sm">{saving?'Saving…':'Save Tag'}</button>
          </div>
        </div>
      )}

      <div style={{ fontFamily:'var(--mono)', fontSize:'.55rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--gold)', marginBottom:'.5rem' }}>Core Tags (locked)</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem', marginBottom:'1.25rem' }}>
        {tags.filter(t=>t.is_core).map(t => (
          <span key={t.id} style={{ fontFamily:'var(--mono)', fontSize:'.6rem', fontWeight:700, padding:'.2em .55em', borderRadius:'var(--radius)', background:t.color+'22', color:t.color, border:`1px solid ${t.color}44` }} title={t.description}>
            {t.label} 🔒
          </span>
        ))}
      </div>

      <div style={{ fontFamily:'var(--mono)', fontSize:'.55rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', marginBottom:'.5rem' }}>Custom Tags</div>
      {tags.filter(t=>!t.is_core).length===0 ? (
        <div style={{ color:'var(--muted2)', fontFamily:'var(--mono)', fontSize:'.72rem' }}>No custom tags yet.</div>
      ) : (
        <div className="tag-mgmt-grid">
          {tags.filter(t=>!t.is_core).map(t => (
            <div key={t.id} className="tag-mgmt-row">
              <div className="tag-mgmt-swatch" style={{ background:t.color }} />
              <span className="tag-mgmt-code" style={{ color:t.color }}>{t.code}</span>
              <span className="tag-mgmt-label">{t.label}</span>
              <span className="tag-mgmt-desc">{t.description}</span>
              <div className="tag-mgmt-actions">
                <button onClick={()=>setEditing(t)} className="btn-ghost btn-sm">Edit</button>
                <button onClick={()=>del(t)} className="btn-danger btn-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AI Auto Draft ─────────────────────────────────────────────
function AutoDraftTab({ tags, onApply }: { tags:Tag[]; onApply:(p:Partial<Policy>)=>void }) {
  const [query, setQuery] = useState('Ghana government policy decision 2025');
  const [depth, setDepth] = useState('standard');
  const [maxTok, setMaxTok] = useState('1000');
  const [searching, setSearching] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [news, setNews] = useState<{headline:string;summary:string;date:string;party:string}[]>([]);
  const [searchStatus, setSearchStatus] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [draft, setDraft] = useState<Partial<Policy>|null>(null);

  const doSearch = async () => {
    if (!ANTH_KEY) { setSearchStatus('err:NEXT_PUBLIC_ANTHROPIC_KEY not set.'); return; }
    setSearching(true); setSearchStatus('loading:Searching for recent Ghana policy news…'); setNews([]); setDraft(null);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':ANTH_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:800,
          tools:[{type:'web_search_20250305',name:'web_search'}],
          system:`You are a Ghana policy news analyst. Search for recent news about the query and return a JSON array of 3–6 items. Each item: {headline, summary, date (YYYY-MM-DD or empty), party (NPP|NDC|Government|empty)}. Return ONLY valid JSON array, no markdown.`,
          messages:[{role:'user',content:`Search query: ${query}`}],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message??'API error');
      const txt = data.content.filter((b:{type:string})=>b.type==='text').map((b:{text:string})=>b.text).join('');
      const items = JSON.parse(txt.replace(/```json|```/g,'').trim());
      if (!Array.isArray(items)||!items.length) throw new Error('No results. Try a different query.');
      setNews(items);
      setSearchStatus(`ok:Found ${items.length} items. Select one to draft.`);
    } catch(e:unknown) { setSearchStatus(`err:${e instanceof Error?e.message:'Search failed.'}`); }
    finally { setSearching(false); }
  };

  const doDraft = async (item: typeof news[0]) => {
    if (!ANTH_KEY) return;
    setDrafting(true); setDraftStatus(`loading:Drafting: ${item.headline}`); setDraft(null);
    const depthInstr = { brief:'1-2 sentences per section.', standard:'Full detailed sections.', deep:'Include sector analysis and international comparisons.' }[depth];
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':ANTH_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:parseInt(maxTok),
          tools:[{type:'web_search_20250305',name:'web_search'}],
          system:`You are a policy analyst for a Ghana civic accountability tracker. ${depthInstr} Return ONLY valid JSON (no markdown) with: title, category (${POLICY_CATEGORIES.join('|')}), date (YYYY-MM-DD), sponsor, party (NPP|NDC|Government|empty), tags (array from: NPP NDC PEP COMP CORR ADM REPU CONT NCOM), intro, background, keydetails, timeline (YYYY-MM-DD | Event per line), structure, outcome, outcome_status (pending|positive|negative), pre_ratings:{transparency,representation,justification,readiness} 0-10, post_ratings:{effectiveness,ux,equity,cost} 0-10 or null, refs:[{label,url}], finance:{totalAmount,fundingSource,fromPublicPurse,donorName,notes}`,
          messages:[{role:'user',content:`Draft policy for: ${JSON.stringify(item)}`}],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message??'API error');
      const txt = data.content.filter((b:{type:string})=>b.type==='text').map((b:{text:string})=>b.text).join('');
      const d = JSON.parse(txt.replace(/```json|```/g,'').trim());
      setDraft(d);
      setDraftStatus('ok:Draft ready. Review all fields then apply to form.');
    } catch(e:unknown) { setDraftStatus(`err:${e instanceof Error?e.message:'Draft failed. Try increasing max tokens.'}`); }
    finally { setDrafting(false); }
  };

  const statusType = (s:string) => s.startsWith('ok:')?'ok':s.startsWith('err:')?'err':'loading';
  const statusMsg  = (s:string) => s.replace(/^(ok|err|loading):/,'');

  return (
    <div>
      <div className="context-controls">
        <span className="context-label">AI Context & Token Settings</span>
        <div className="context-row">
          <div>
            <div className="field-label" style={{ marginBottom:'.25rem' }}>Max Tokens</div>
            <select className="context-select" value={maxTok} onChange={e=>setMaxTok(e.target.value)}>
              <option value="800">800 — Quick summary</option>
              <option value="1000">1000 — Balanced (default)</option>
              <option value="1500">1500 — Detailed analysis</option>
              <option value="2000">2000 — Niche/complex policy</option>
            </select>
          </div>
          <div>
            <div className="field-label" style={{ marginBottom:'.25rem' }}>Research Depth</div>
            <select className="context-select" value={depth} onChange={e=>setDepth(e.target.value)}>
              <option value="brief">Brief — Headlines only</option>
              <option value="standard">Standard — Full sections</option>
              <option value="deep">Deep — Include sector analysis</option>
            </select>
          </div>
          <div className="context-hint">Increase tokens for complex sector<br/>frameworks. Reduces truncation risk.</div>
        </div>
      </div>

      <div className="auto-draft-bar">
        <input className="auto-search-inp" value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. Ghana IMF programme, Agyapa deal, RTI Act…" />
        <button className="btn-primary" onClick={doSearch} disabled={searching||!ANTH_KEY}>
          {searching?<><span className="spinner" style={{marginRight:'.4rem'}}/>Searching…</>:'Search News'}
        </button>
      </div>
      {!ANTH_KEY && <div className="status-box err">NEXT_PUBLIC_ANTHROPIC_KEY not set in Vercel env vars.</div>}
      {searchStatus && <div className={`status-box ${statusType(searchStatus)}`}>{statusType(searchStatus)==='loading'&&<span className="spinner"/>}{statusMsg(searchStatus)}</div>}

      {news.length>0 && (
        <table className="news-tbl">
          <thead><tr><th>Headline</th><th>Date</th><th>Party</th><th></th></tr></thead>
          <tbody>
            {news.map((item,i)=>(
              <tr key={i}>
                <td><div className="news-headline">{item.headline}</div><div className="news-summary">{item.summary}</div></td>
                <td style={{ fontFamily:'var(--mono)', fontSize:'.6rem', whiteSpace:'nowrap' }}>{item.date}</td>
                <td>{item.party&&<span className={`tag tag-${item.party}`} style={{ fontSize:'.5rem' }}>{item.party}</span>}</td>
                <td><button className="pick-btn" onClick={()=>doDraft(item)} disabled={drafting}>Draft →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {draftStatus && <div className={`status-box ${statusType(draftStatus)}`}>{statusType(draftStatus)==='loading'&&<span className="spinner"/>}{statusMsg(draftStatus)}</div>}

      {draft && (
        <div style={{ background:'var(--surface2)', border:'1px solid rgba(201,168,76,.2)', padding:'1rem', marginTop:'.75rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.75rem', flexWrap:'wrap', gap:'.5rem' }}>
            <div>
              <div style={{ fontFamily:'var(--mono)', fontSize:'.55rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--gold)', marginBottom:'.2rem' }}>Draft Ready</div>
              <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:'1rem' }}>{draft.title}</div>
            </div>
            <button onClick={()=>onApply(draft)} className="btn-primary btn-sm">Load into Policy Form →</button>
          </div>
          <pre style={{ fontSize:'.72rem', color:'var(--muted)', whiteSpace:'pre-wrap', maxHeight:280, overflowY:'auto', fontFamily:'var(--mono)', lineHeight:1.5 }}>
            {JSON.stringify(draft,null,2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin ────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('hub');

  const [policies, setPolicies]   = useState<Policy[]>([]);
  const [entities, setEntities]   = useState<Entity[]>([]);
  const [tags, setTags]           = useState<Tag[]>([]);
  const [editPolicy, setEditPolicy] = useState<Partial<Policy>|null>(null);
  const [editEntity, setEditEntity] = useState<Partial<Entity>|null>(null);

  useEffect(()=>{
    (async()=>{
      const sb = createClient();
      const { data:{ user } } = await sb.auth.getUser();
      if (user&&user.id===ADMIN_UID) setAuthed(true);
      setChecking(false);
    })();
  },[]);

  const loadAll = async () => {
    const [p,e,t] = await Promise.all([
      dbList('policies','created_at.desc'),
      dbList('entities','name.asc'),
      dbList('tags','is_core.desc,label.asc'),
    ]);
    setPolicies(Array.isArray(p)?p:[]);
    setEntities(Array.isArray(e)?e:[]);
    setTags(Array.isArray(t)?t:[]);
  };

  useEffect(()=>{ if(authed) loadAll(); },[authed]);

  const signIn = async () => {
    const sb = createClient();
    await sb.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.href } });
  };

  const TABS: {id:Tab;label:string}[] = [
    {id:'hub',label:'Hub'},{id:'policies',label:'Policies'},{id:'entities',label:'Officials'},{id:'tags',label:'Tags'},{id:'auto',label:'AI Draft'},{id:'manual',label:'Manual Entry'},
  ];

  if (checking) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}><span className="spinner" style={{ width:24, height:24, borderWidth:3 }} /></div>;

  if (!authed) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1rem', textAlign:'center' }}>
      <div style={{ fontFamily:'var(--display)', fontSize:'1.5rem', fontWeight:900 }}>Admin Access Required</div>
      <p style={{ color:'var(--muted)', fontWeight:300 }}>Sign in with the admin Google account.</p>
      <button onClick={signIn} className="btn-primary">Sign in with Google</button>
    </div>
  );

  // Policy edit view
  if (editPolicy !== null) return (
    <div className="admin-shell">
      <PolicyForm initial={editPolicy} tags={tags} policies={policies}
        onSaved={()=>{ setEditPolicy(null); setTab('policies'); loadAll(); }}
        onCancel={()=>setEditPolicy(null)} />
    </div>
  );

  // Entity edit view
  if (editEntity !== null) return (
    <div className="admin-shell">
      <EntityForm initial={editEntity} tags={tags} policies={policies}
        onSaved={()=>{ setEditEntity(null); setTab('entities'); loadAll(); }}
        onCancel={()=>setEditEntity(null)} />
    </div>
  );

  return (
    <div className="admin-shell">
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontFamily:'var(--display)', fontSize:'1.5rem', fontWeight:900, marginBottom:'.25rem' }}>Admin</div>
        <div style={{ fontFamily:'var(--mono)', fontSize:'.6rem', color:'var(--muted)' }}>Public Profile — Ghana Accountability Tracker</div>
      </div>

      <div className="admin-tabs-row">
        {TABS.map(t=>(
          <button key={t.id} className={`admin-tab-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* HUB */}
      {tab==='hub' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'.75rem', marginBottom:'1.5rem' }}>
            {[
              { label:'Policies', num: policies.length, sub:`${policies.filter(p=>p.status==='published').length} published` },
              { label:'Officials', num: entities.length, sub:`${entities.filter(e=>e.status==='published').length} published` },
              { label:'Tags', num: tags.length, sub:`${tags.filter(t=>t.is_core).length} core` },
            ].map(item=>(
              <div key={item.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'1rem' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'.55rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', marginBottom:'.3rem' }}>{item.label}</div>
                <div style={{ fontFamily:'var(--display)', fontSize:'1.8rem', fontWeight:700, color:'var(--gold)' }}>{item.num}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:'.55rem', color:'var(--muted2)' }}>{item.sub}</div>
              </div>
            ))}
          </div>

          <div className="section-sep">Recent Policies</div>
          <table className="hub-table">
            <thead><tr><th>Title</th><th>Status</th><th>Category</th><th>Actions</th></tr></thead>
            <tbody>
              {policies.slice(0,10).map(p=>(
                <tr key={p.id}>
                  <td style={{ fontWeight:600 }}>{p.title}</td>
                  <td><span className={`outcome-badge ${p.status==='published'?'positive':p.status==='draft'?'pending':'negative'}`}>{p.status}</span></td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'.62rem', color:'var(--muted)' }}>{p.category}</td>
                  <td>
                    <div className="hub-actions">
                      <button onClick={()=>setEditPolicy(p)} className="btn-ghost btn-sm">Edit</button>
                      <a href={`/policies/${p.id}`} target="_blank" rel="noopener" className="btn-ghost btn-sm">View</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* POLICIES */}
      {tab==='policies' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h2 style={{ fontFamily:'var(--display)', fontSize:'1.2rem', fontWeight:700 }}>Policies ({policies.length})</h2>
            <button onClick={()=>setEditPolicy(blankPolicy())} className="btn-primary btn-sm">+ New Policy</button>
          </div>
          <table className="hub-table">
            <thead><tr><th>Title</th><th>Status</th><th>Category</th><th>Actions</th></tr></thead>
            <tbody>
              {policies.map(p=>(
                <tr key={p.id}>
                  <td style={{ fontWeight:600 }}>{p.title}</td>
                  <td><span className={`outcome-badge ${p.status==='published'?'positive':'pending'}`}>{p.status}</span></td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'.62rem', color:'var(--muted)' }}>{p.category}</td>
                  <td>
                    <div className="hub-actions">
                      <button onClick={()=>setEditPolicy(p)} className="btn-ghost btn-sm">Edit</button>
                      <a href={`/policies/${p.id}`} target="_blank" rel="noopener" className="btn-ghost btn-sm">View</a>
                      <button onClick={async()=>{ if(!confirm('Delete?'))return; await db('policies','DELETE',undefined,p.id); loadAll(); }} className="btn-danger btn-sm">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ENTITIES */}
      {tab==='entities' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h2 style={{ fontFamily:'var(--display)', fontSize:'1.2rem', fontWeight:700 }}>Officials & Institutions ({entities.length})</h2>
            <button onClick={()=>setEditEntity(blankEntity())} className="btn-primary btn-sm">+ New Entity</button>
          </div>
          <table className="hub-table">
            <thead><tr><th>Name</th><th>Status</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {entities.map(e=>(
                <tr key={e.id}>
                  <td style={{ fontWeight:600 }}>{e.name}</td>
                  <td><span className={`outcome-badge ${e.status==='published'?'positive':'pending'}`}>{e.status}</span></td>
                  <td style={{ fontFamily:'var(--mono)', fontSize:'.62rem', color:'var(--muted)' }}>{e.role}</td>
                  <td>
                    <div className="hub-actions">
                      <button onClick={()=>setEditEntity(e)} className="btn-ghost btn-sm">Edit</button>
                      <a href={`/officials/${e.id}`} target="_blank" rel="noopener" className="btn-ghost btn-sm">View</a>
                      <button onClick={async()=>{ if(!confirm('Delete?'))return; await db('entities','DELETE',undefined,e.id); loadAll(); }} className="btn-danger btn-sm">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAGS */}
      {tab==='tags' && <TagManager tags={tags} onRefresh={loadAll} />}

      {/* AI DRAFT */}
      {tab==='auto' && (
        <AutoDraftTab tags={tags} onApply={draft=>{ setEditPolicy({...blankPolicy(),...draft}); }} />
      )}

      {/* MANUAL */}
      {tab==='manual' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem', marginBottom:'1rem' }}>
            <button onClick={()=>setEditPolicy(blankPolicy())} className="btn-primary" style={{ padding:'1rem', justifyContent:'center', flexDirection:'column', gap:'.3rem', fontSize:'.75rem' }}>
              <div style={{ fontSize:'1.5rem' }}>📋</div>
              New Policy
            </button>
            <button onClick={()=>setEditEntity(blankEntity())} className="btn-ghost" style={{ padding:'1rem', justifyContent:'center', flexDirection:'column', gap:'.3rem', fontSize:'.75rem' }}>
              <div style={{ fontSize:'1.5rem' }}>👤</div>
              New Official / Institution
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
