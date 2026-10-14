/*
# Create schema for Egyptian Student Platform (Thanaweya Amma)

1. New Tables
- `posts`: Community feed posts with title, body, author badge, and like count
- `post_comments`: Comments on posts by users
- `post_likes`: Tracks individual likes to prevent duplicate likes
- `quizzes`: Quiz metadata (title, subject, duration)
- `quiz_questions`: MCQ questions belonging to quizzes
- `student_progress`: Tracks progress percentage per subject
- `exam_counters`: Tracks exam completion counters per subject

2. Security
- Single-tenant app with no sign-in screen
- All tables use TO anon, authenticated with USING (true) / WITH CHECK (true)
- Data is intentionally public/shared
*/

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  author_badge text NOT NULL DEFAULT 'الإدارة',
  likes_count integer NOT NULL DEFAULT 0,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_posts" ON posts;
CREATE POLICY "anon_select_posts" ON posts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_posts" ON posts;
CREATE POLICY "anon_insert_posts" ON posts FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_posts" ON posts;
CREATE POLICY "anon_update_posts" ON posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_posts" ON posts;
CREATE POLICY "anon_delete_posts" ON posts FOR DELETE TO anon, authenticated USING (true);

-- Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'طالب',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_comments" ON post_comments;
CREATE POLICY "anon_select_comments" ON post_comments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_comments" ON post_comments;
CREATE POLICY "anon_insert_comments" ON post_comments FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_comments" ON post_comments;
CREATE POLICY "anon_delete_comments" ON post_comments FOR DELETE TO anon, authenticated USING (true);

-- Post likes table (tracks individual likes by session ID)
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, session_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_likes" ON post_likes;
CREATE POLICY "anon_select_likes" ON post_likes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_likes" ON post_likes;
CREATE POLICY "anon_insert_likes" ON post_likes FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_likes" ON post_likes;
CREATE POLICY "anon_delete_likes" ON post_likes FOR DELETE TO anon, authenticated USING (true);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 15,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quizzes" ON quizzes;
CREATE POLICY "anon_select_quizzes" ON quizzes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quizzes" ON quizzes;
CREATE POLICY "anon_insert_quizzes" ON quizzes FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quizzes" ON quizzes;
CREATE POLICY "anon_update_quizzes" ON quizzes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quizzes" ON quizzes;
CREATE POLICY "anon_delete_quizzes" ON quizzes FOR DELETE TO anon, authenticated USING (true);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_select_quiz_questions" ON quiz_questions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_insert_quiz_questions" ON quiz_questions FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_update_quiz_questions" ON quiz_questions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_delete_quiz_questions" ON quiz_questions FOR DELETE TO anon, authenticated USING (true);

-- Student progress table
CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL UNIQUE,
  progress integer NOT NULL DEFAULT 0,
  total_lessons integer NOT NULL DEFAULT 100,
  completed_lessons integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_progress" ON student_progress;
CREATE POLICY "anon_select_progress" ON student_progress FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_progress" ON student_progress;
CREATE POLICY "anon_update_progress" ON student_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Exam counters table
CREATE TABLE IF NOT EXISTS exam_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL UNIQUE,
  exams_taken integer NOT NULL DEFAULT 0,
  exams_passed integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exam_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_exam_counters" ON exam_counters;
CREATE POLICY "anon_select_exam_counters" ON exam_counters FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_exam_counters" ON exam_counters;
CREATE POLICY "anon_update_exam_counters" ON exam_counters FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed initial data

-- Seed student progress
INSERT INTO student_progress (subject, progress, total_lessons, completed_lessons) VALUES
  ('اللغة العربية', 68, 120, 82),
  ('الفيزياء', 45, 100, 45),
  ('الكيمياء', 52, 100, 52),
  ('الأحياء', 71, 110, 78),
  ('الرياضيات', 38, 100, 38)
ON CONFLICT (subject) DO NOTHING;

-- Seed exam counters
INSERT INTO exam_counters (subject, exams_taken, exams_passed) VALUES
  ('اللغة العربية', 12, 9),
  ('الفيزياء', 8, 5),
  ('الكيمياء', 10, 7),
  ('الأحياء', 14, 11),
  ('الرياضيات', 6, 3)
ON CONFLICT (subject) DO NOTHING;

-- Seed initial quiz (Physics)
INSERT INTO quizzes (id, title, subject, duration_minutes, description) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'امتحان الفيزياء - الحركة والموجات', 'الفيزياء', 10, 'امتحان في وحدة الحركة والموجات لطلاب الثانوية العامة')
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question, options, correct_index) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'السرعة المتجهة هي:', ARRAY['المسافة المقطوعة في وحدة الزمن', 'إزاحة الجسم في وحدة الزمن', 'تغير السرعة في وحدة الزمن', 'مسار الجسم'], 1),
  ('a0000001-0000-0000-0000-000000000001', 'وحدة قياس التردت هي:', ARRAY['هرتز', 'متر/ثانية', 'نيوتن', 'جول'], 0),
  ('a0000001-0000-0000-0000-000000000001', 'الموجة التي اهتزاز جزيئاتها عمودي على اتجاه انتشارها تسمى:', ARRAY['موجة طولية', 'موجة مستعرضة', 'موجة دائرية', 'موجة سطحية'], 1),
  ('a0000001-0000-0000-0000-000000000001', 'علاقة الطول الموجي بالتردت وسرعة الموجة هي:', ARRAY['λ = v × f', 'λ = v / f', 'λ = f / v', 'λ = v + f'], 1),
  ('a0000001-0000-0000-0000-000000000001', 'الشغل المبذول على جسم يتحرك مسافة d بقوة F بزاوية θ هو:', ARRAY['W = F × d × sin θ', 'W = F × d / cos θ', 'W = F × d × cos θ', 'W = F + d + cos θ'], 2)
ON CONFLICT DO NOTHING;

-- Seed initial posts
INSERT INTO posts (id, title, body, author_badge, likes_count, pinned) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'جدول امتحانات نهاية الترم الأول 2026', 'وزارة التربية والتعليم تعلن عن جدول امتحانات الثانوية العامة للترم الأول. يبدأ الامتحان يوم السبت 18 يناير 2026 وينتهي يوم الخميس 30 يناير 2026. ننصح جميع الطلاب بالاستعداد المبكر ومراجعة المنهج كاملاً.', 'الإدارة', 42, true),
  ('b0000001-0000-0000-0000-000000000002', 'نصائح للمذاكرة الفعالة في مادة الأحياء', '1. ابدأ بفهم المفاهيم الأساسية قبل الحفظ\n2. استخدم الخرائط الذهنية لربط المعلومات\n3. ارسم الرسوم التوضيحية بنفسك\n4. حل أسئلة السنوات السابقة\n5. راجع يومياً ولو لمدة ساعة', 'الإدارة', 28, false),
  ('b0000001-0000-0000-0000-000000000003', 'تغيير في منهج الكيمياء العضوية', 'تم تحديث جزء الكيمياء العضوية في منهج الثانوية العامة. تم حذف فصل الهيدروكربونات الأروماتية وإضافة فصل جديد عن البوليمرات. يرجى من الطلاب مراجعة المنهج المحدث على الموقع الرسمي للوزارة.', 'الإدارة', 15, false)
ON CONFLICT (id) DO NOTHING;

-- Seed initial comments
INSERT INTO post_comments (post_id, author_name, content) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'أحمد محمد', 'شكراً على الإعلان، هل سيتم نشر الجدول التفصيلي قريباً؟'),
  ('b0000001-0000-0000-0000-000000000001', 'سارة علي', 'بالتوفيق للجميع يا رب'),
  ('b0000001-0000-0000-0000-000000000002', 'محمود خالد', 'نصائح ممتازة، جربت طريقة الخرائط الذهنية ونتيجتها رائعة')
ON CONFLICT DO NOTHING;
