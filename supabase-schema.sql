-- ============================================================
-- PUBLIC PROFILE — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── POLICIES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS policies (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  title          text NOT NULL,
  category       text NOT NULL DEFAULT '',
  date           date,
  sponsor        text NOT NULL DEFAULT 'Unknown',
  party          text NOT NULL DEFAULT '',
  tags           text[] NOT NULL DEFAULT '{}',
  status         text NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','published','archived')),
  intro          text NOT NULL DEFAULT '',
  background     text NOT NULL DEFAULT '',
  keydetails     text NOT NULL DEFAULT '',
  timeline       text NOT NULL DEFAULT '',
  structure      text NOT NULL DEFAULT '',
  outcome        text NOT NULL DEFAULT '',
  outcome_status text NOT NULL DEFAULT 'pending'
                   CHECK (outcome_status IN ('pending','positive','negative')),
  pre_ratings    jsonb NOT NULL DEFAULT '{}',
  post_ratings   jsonb NOT NULL DEFAULT '{}',
  finance        jsonb,
  refs           jsonb NOT NULL DEFAULT '[]',
  likes          integer NOT NULL DEFAULT 0
);

-- ── ENTITIES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  type            text NOT NULL DEFAULT 'official'
                    CHECK (type IN ('official','institution')),
  status          text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','published')),
  name            text NOT NULL,
  role            text NOT NULL DEFAULT '',
  party           text NOT NULL DEFAULT '',
  tenure          text NOT NULL DEFAULT '',
  tags            text[] NOT NULL DEFAULT '{}',
  bio             text NOT NULL DEFAULT '',
  background      text NOT NULL DEFAULT '',
  timeline        text NOT NULL DEFAULT '',
  photos          text[] NOT NULL DEFAULT '{}',
  media_links     jsonb NOT NULL DEFAULT '[]',
  linked_policies text[] NOT NULL DEFAULT '{}',
  updates         jsonb NOT NULL DEFAULT '[]',
  budget          text,
  website         text
);

-- ── COMMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  policy_id  uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  user_name  text NOT NULL,
  user_email text,
  text       text NOT NULL,
  likes      integer NOT NULL DEFAULT 0
);

-- ── RATINGS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  policy_id  uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  user_email text NOT NULL DEFAULT 'anonymous',
  ratings    jsonb NOT NULL DEFAULT '{}'
);

-- One rating per user per policy
CREATE UNIQUE INDEX IF NOT EXISTS ratings_policy_email_unique
  ON ratings (policy_id, user_email);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS policies_status_idx ON policies (status);
CREATE INDEX IF NOT EXISTS policies_date_idx   ON policies (date DESC);
CREATE INDEX IF NOT EXISTS entities_status_idx ON entities (status);
CREATE INDEX IF NOT EXISTS comments_policy_idx ON comments (policy_id);
CREATE INDEX IF NOT EXISTS ratings_policy_idx  ON ratings  (policy_id);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings  ENABLE ROW LEVEL SECURITY;

-- Anyone can read published policies
CREATE POLICY "public_read_policies" ON policies
  FOR SELECT USING (status = 'published');

-- Anyone can read published entities
CREATE POLICY "public_read_entities" ON entities
  FOR SELECT USING (status = 'published');

-- Anyone can read comments
CREATE POLICY "public_read_comments" ON comments
  FOR SELECT USING (true);

-- Anyone can post comments (open platform, no auth)
CREATE POLICY "public_insert_comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Anyone can read ratings
CREATE POLICY "public_read_ratings" ON ratings
  FOR SELECT USING (true);

-- Anyone can submit/update ratings
CREATE POLICY "public_insert_ratings" ON ratings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_update_ratings" ON ratings
  FOR UPDATE USING (true) WITH CHECK (true);

-- Full access for service role (used by admin server actions)
-- The publishable key used in server.ts has service_role bypass via RLS
-- If using anon key for admin writes, add these:
CREATE POLICY "anon_insert_policies" ON policies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update_policies" ON policies
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_policies" ON policies
  FOR DELETE USING (true);

CREATE POLICY "anon_read_all_policies" ON policies
  FOR SELECT USING (true);  -- Admin hub needs drafts too

CREATE POLICY "anon_insert_entities" ON entities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update_entities" ON entities
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_entities" ON entities
  FOR DELETE USING (true);

CREATE POLICY "anon_read_all_entities" ON entities
  FOR SELECT USING (true);

-- ── HELPER FUNCTION: increment likes ─────────────────────────
CREATE OR REPLACE FUNCTION increment_policy_likes(policy_id uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE policies SET likes = likes + 1 WHERE id = policy_id;
$$;
