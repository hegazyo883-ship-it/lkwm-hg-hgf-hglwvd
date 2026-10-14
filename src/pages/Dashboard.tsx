import { useEffect, useState } from 'react';
import {
  BookOpen,
  Atom,
  FlaskConical,
  Dna,
  Languages,
  TrendingUp,
  Award,
  Target,
  Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { subjectMeta } from '@/lib/subjects';
import type { StudentProgress, ExamCounter } from '@/lib/types';
import { AdsterraAd } from '@/components/AdsterraAd';
import { StudyPlanner } from '@/components/StudyPlanner';

const iconMap: Record<string, typeof BookOpen> = {
  BookOpen,
  Atom,
  FlaskConical,
  Dna,
  Languages,
};

export function Dashboard() {
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [counters, setCounters] = useState<ExamCounter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [p, c] = await Promise.all([
      supabase.from('student_progress').select('*').order('subject'),
      supabase.from('exam_counters').select('*').order('subject'),
    ]);
    if (p.data) setProgress(p.data);
    if (c.data) setCounters(c.data);
    setLoading(false);
  };

  const totalExams = counters.reduce((sum, c) => sum + c.exams_taken, 0);
  const passedExams = counters.reduce((sum, c) => sum + c.exams_passed, 0);
  const avgProgress =
    progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.progress, 0) / progress.length)
      : 0;

  return (
    <div className="space-y-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-cyan-600 mb-1">رحلتك الدراسية تبدأ هنا</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">لوحة متابعة الطالب</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> كل شيء جاهز للمذاكرة
        </div>
      </div>

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-blue-600 via-cyan-500 to-teal-500 p-7 shadow-xl">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative max-w-3xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            أهلاً بك في منصة الطالب المصري
          </h2>
          <p className="text-blue-50 text-sm leading-relaxed max-w-2xl">
            منصتك التعليمية المتكاملة لاجتياز الثانوية العامة. تابع تقدمك في المواد،
            حل الامتحانات، واستفد من المساعد الذكي في دراستك.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <Target className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">متوسط التقدم: {avgProgress}%</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <Award className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">امتحانات مجتازة: {passedExams}/{totalExams}</span>
            </div>
          </div>
        </div>
      </div>

      <AdsterraAd />

      <StudyPlanner />

      {/* Progress bars */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">تقدم المواد الدراسية</h3>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {progress.map((item) => {
              const meta = subjectMeta[item.subject];
              const Icon = meta ? iconMap[meta.icon] : BookOpen;
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${meta?.color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: meta?.color }} />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {item.subject}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        ({item.completed_lessons}/{item.total_lessons} درس)
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      {item.progress}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${item.progress}%`,
                        background: `linear-gradient(to left, ${meta?.color}, ${meta?.color}dd)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exam counters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">إحصائيات الامتحانات</h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {counters.map((counter) => {
              const meta = subjectMeta[counter.subject];
              const Icon = meta ? iconMap[meta.icon] : BookOpen;
              const passRate = counter.exams_taken > 0
                ? Math.round((counter.exams_passed / counter.exams_taken) * 100)
                : 0;
              return (
                <div
                  key={counter.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 hover:shadow-md transition-all"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${meta?.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: meta?.color }} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{counter.subject}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                      {counter.exams_taken}
                    </span>
                    <span className="text-xs text-slate-400">امتحان</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs text-emerald-500 font-medium">
                      {counter.exams_passed} نجاح
                    </span>
                    <span className="text-xs text-slate-400">({passRate}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
