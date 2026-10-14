export interface Post {
  id: string;
  title: string;
  body: string;
  author_badge: string;
  likes_count: number;
  pinned: boolean;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  description: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_index: number;
}

export interface StudentProgress {
  id: string;
  subject: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  updated_at: string;
}

export interface ExamCounter {
  id: string;
  subject: string;
  exams_taken: number;
  exams_passed: number;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type ThemeMode =
  | 'normal'
  | 'ramadan'
  | 'eid_fitr'
  | 'eid_adha'
  | 'mawlid'
  | 'october'
  | 'sinai'
  | 'republic'
  | 'newyear'
  | 'mothersday'
  | 'teachersday'
  | 'nationalday';
export type ColorMode = 'light' | 'dark';
