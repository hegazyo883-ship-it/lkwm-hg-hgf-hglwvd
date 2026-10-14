/*
# Add persistent study sessions

1. New Tables
- `study_sessions`: daily study plan entries for the shared no-login platform.
- `id`: unique session identifier.
- `session_id`: browser session identifier used to keep each student's plan separate.
- `subject`: selected school subject.
- `title`: short session title.
- `duration_minutes`: planned focus duration.
- `status`: planned, active, or completed.
- `created_at`: creation timestamp.
- `completed_at`: completion timestamp when finished.

2. Security
- Row Level Security is enabled.
- The app has no sign-in screen, so anon and authenticated roles can use the table.
- Client session filtering keeps plans separated between browser sessions.
- Four separate CRUD policies are provided.

3. Important Notes
- Existing data is untouched.
- The table is intentionally scoped by the browser session because this app currently has no accounts.
*/

CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  subject text NOT NULL,
  title text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 25 CHECK (duration_minutes IN (25, 50, 90)),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS study_sessions_session_created_idx
  ON study_sessions (session_id, created_at DESC);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_study_sessions" ON study_sessions;
CREATE POLICY "anon_select_study_sessions" ON study_sessions
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_study_sessions" ON study_sessions;
CREATE POLICY "anon_insert_study_sessions" ON study_sessions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_study_sessions" ON study_sessions;
CREATE POLICY "anon_update_study_sessions" ON study_sessions
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_study_sessions" ON study_sessions;
CREATE POLICY "anon_delete_study_sessions" ON study_sessions
  FOR DELETE TO anon, authenticated USING (true);
