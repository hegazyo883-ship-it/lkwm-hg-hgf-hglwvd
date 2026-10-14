/*
# Create study schedule table (جدول المزاكرة)

1. New Tables
- `study_schedule`: stores each student's lesson times and prayer times so the system can auto-generate a study schedule.
- `id`: unique row identifier.
- `session_id`: browser session identifier (same pattern as study_sessions) to keep each student's data separate.
- `day_of_week`: integer 0–6 (Saturday=0 … Friday=6) identifying which day this entry belongs to.
- `entry_type`: 'lesson' or 'prayer'.
- `label`: display text (e.g. "درس الفيزياء", "صلاة الظهر").
- `start_time`: HH:MM 24h start time.
- `end_time`: HH:MM 24h end time.
- `created_at`: creation timestamp.

2. Security
- Row Level Security is enabled.
- The app has no sign-in screen, so anon and authenticated roles can use the table (same as study_sessions).
- Client session filtering keeps data separated between browser sessions.
- Four separate CRUD policies are provided.

3. Important Notes
- Existing data is untouched.
- The table is scoped by browser session because this app currently has no accounts.
*/

CREATE TABLE IF NOT EXISTS study_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  entry_type text NOT NULL CHECK (entry_type IN ('lesson', 'prayer')),
  label text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS study_schedule_session_day_idx
  ON study_schedule (session_id, day_of_week, start_time);

ALTER TABLE study_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_study_schedule" ON study_schedule;
CREATE POLICY "anon_select_study_schedule" ON study_schedule
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_study_schedule" ON study_schedule;
CREATE POLICY "anon_insert_study_schedule" ON study_schedule
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_study_schedule" ON study_schedule;
CREATE POLICY "anon_update_study_schedule" ON study_schedule
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_study_schedule" ON study_schedule;
CREATE POLICY "anon_delete_study_schedule" ON study_schedule
  FOR DELETE TO anon, authenticated USING (true);
