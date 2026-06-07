'use client';

import { useState, useEffect } from 'react';
import type { Comment } from '@/lib/types';
import { addComment, upvoteComment } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';

interface CommentFormProps {
  policyId: string;
  initialComments: Comment[];
}

export function CommentForm({ policyId, initialComments }: CommentFormProps) {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [userChecked, setUserChecked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [upvoting, setUpvoting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser({ id: u.id, email: u.email!, name: u.user_metadata?.full_name ?? u.email! });
      }
      setUserChecked(true);
    })();
  }, []);

  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
  };

  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    setSaving(true);
    setError('');
    try {
      const newComment = await addComment({
        policy_id: policyId,
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        text: text.trim(),
      });
      setComments(prev => [newComment as Comment, ...prev]);
      setText('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to post comment.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpvote = async (commentId: string) => {
    if (!user || upvoting) return;
    setUpvoting(commentId);
    try {
      await upvoteComment(commentId, user.id);
      setComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, likes: c.likes + 1, upvoted_by: [...(c.upvoted_by ?? []), user.id] } : c
      ));
    } catch {}
    finally { setUpvoting(null); }
  };

  return (
    <section>
      <div className="section-label">Discussion</div>

      {/* Comment input */}
      {!userChecked ? null : !user ? (
        <div style={{
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
        }}>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Sign in to join the discussion.
          </p>
          <button onClick={handleSignIn} className="btn btn-primary btn-sm">Sign in with Google</button>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
            Commenting as <strong style={{ color: 'var(--text)' }}>{user.name}</strong>
          </div>
          <textarea
            className="form-textarea"
            placeholder="Share your thoughts on this policy…"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            style={{ marginBottom: '0.625rem', minHeight: '80px' }}
          />
          {error && <div className="alert alert-error" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>{error}</div>}
          <button
            onClick={handleSubmit}
            disabled={saving || !text.trim()}
            className="btn btn-primary btn-sm"
          >
            {saving ? 'Posting…' : 'Post Comment'}
          </button>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {comments.map(comment => {
            const hasUpvoted = user && comment.upvoted_by?.includes(user.id);
            return (
              <div
                key={comment.id}
                style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{comment.user_name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(comment.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '0.625rem' }}>
                  {comment.text}
                </p>
                <button
                  onClick={() => handleUpvote(comment.id)}
                  disabled={!!hasUpvoted || !user || upvoting === comment.id}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: '100px',
                    padding: '0.2em 0.65em',
                    fontSize: '0.78rem',
                    color: hasUpvoted ? 'var(--accent)' : 'var(--text-3)',
                    cursor: hasUpvoted || !user ? 'default' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all var(--transition)',
                  }}
                >
                  👍 {comment.likes}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
