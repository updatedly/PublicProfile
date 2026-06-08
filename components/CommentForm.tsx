'use client';
import { useState, useEffect } from 'react';
import type { Comment } from '@/lib/types';
import { addComment, upvoteComment } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';

interface Props { policyId: string; initialComments: Comment[]; }

export function CommentForm({ policyId, initialComments }: Props) {
  const [user, setUser] = useState<{ id:string; email:string; name:string }|null>(null);
  const [checked, setChecked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user: u } } = await sb.auth.getUser();
      if (u) setUser({ id: u.id, email: u.email!, name: u.user_metadata?.full_name ?? u.email! });
      setChecked(true);
    })();
  }, []);

  const signIn = async () => {
    const sb = createClient();
    await sb.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.href } });
  };

  const submit = async () => {
    if (!user || !text.trim()) return;
    setSaving(true); setError('');
    try {
      const c = await addComment({ policy_id: policyId, user_id: user.id, user_name: user.name, user_email: user.email, text: text.trim() });
      setComments(prev => [c as Comment, ...prev]);
      setText('');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed.'); }
    finally { setSaving(false); }
  };

  const upvote = async (id: string) => {
    if (!user) return;
    try {
      await upvoteComment(id, user.id);
      setComments(prev => prev.map(c => c.id === id && !c.upvoted_by?.includes(user.id)
        ? { ...c, likes: c.likes+1, upvoted_by: [...(c.upvoted_by??[]), user.id] } : c));
    } catch {}
  };

  return (
    <div>
      {/* Input */}
      {checked && !user ? (
        <div style={{ padding:'.85rem 1rem', background:'var(--surface)', border:'1px solid var(--border)', marginBottom:'1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
          <span style={{ fontSize:'.82rem', color:'var(--muted)', fontWeight:300 }}>Sign in to join the discussion.</span>
          <button onClick={signIn} className="btn-primary btn-sm">Sign in with Google</button>
        </div>
      ) : user ? (
        <div className="comment-form">
          <div style={{ fontSize:'.72rem', fontFamily:'var(--mono)', color:'var(--muted2)', marginBottom:'.4rem' }}>
            As <span style={{ color:'var(--gold)' }}>{user.name}</span>
          </div>
          <textarea
            className="comment-textarea"
            placeholder="Share your thoughts on this policy…"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
          />
          {error && <div style={{ color:'#e74c3c', fontSize:'.75rem', marginBottom:'.4rem', fontFamily:'var(--mono)' }}>{error}</div>}
          <div className="comment-row-bottom">
            <button onClick={submit} disabled={saving || !text.trim()} className="btn-primary btn-sm">
              {saving ? 'Posting…' : 'Post Comment'}
            </button>
          </div>
        </div>
      ) : null}

      {/* List */}
      {comments.length === 0 ? (
        <div style={{ color:'var(--muted2)', fontFamily:'var(--mono)', fontSize:'.72rem', padding:'.75rem 0' }}>
          No comments yet.
        </div>
      ) : (
        <div>
          {comments.map(c => {
            const alreadyUpvoted = user && c.upvoted_by?.includes(user.id);
            return (
              <div key={c.id} className="comment-item">
                <div className="comment-meta">
                  <span className="comment-author">{c.user_name}</span>
                  <span className="comment-date">
                    {new Date(c.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                  </span>
                </div>
                <div className="comment-text">{c.text}</div>
                <button
                  onClick={() => upvote(c.id)}
                  disabled={!!alreadyUpvoted || !user}
                  style={{ marginTop:'.45rem', background:'none', border:'1px solid var(--border2)', borderRadius:'var(--radius)', padding:'.2em .55em', fontFamily:'var(--mono)', fontSize:'.58rem', cursor: alreadyUpvoted || !user ? 'default' : 'pointer', color: alreadyUpvoted ? 'var(--gold)' : 'var(--muted2)', transition:'all .2s' }}
                >
                  👍 {c.likes}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
