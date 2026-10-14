import { useEffect, useState, useCallback } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Quiz, QuizQuestion } from '@/lib/types';
import { AdsterraAd } from '@/components/AdsterraAd';

type QuizState = 'select' | 'taking' | 'results';

export function QuizCenter() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [state, setState] = useState<QuizState>('select');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
    if (data) setQuizzes(data);
    setLoading(false);
  };

  // Timer effect
  useEffect(() => {
    if (state !== 'taking' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  const startQuiz = async (quiz: Quiz) => {
    setSubmitting(true);
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('created_at');

    if (data && data.length > 0) {
      setSelectedQuiz(quiz);
      setQuestions(data);
      setAnswers({});
      setTimeLeft(quiz.duration_minutes * 60);
      setState('taking');
    }
    setSubmitting(false);
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = useCallback(() => {
    setState('results');
  }, []);

  const score = questions.filter((q) => answers[q.id] === q.correct_index).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = percentage >= 50;

  const handleRetake = () => {
    setState('select');
    setSelectedQuiz(null);
    setQuestions([]);
    setAnswers({});
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Results screen
  if (state === 'results' && selectedQuiz) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
          <div
            className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
              passed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            {passed ? (
              <Award className="w-10 h-10 text-emerald-500" />
            ) : (
              <XCircle className="w-10 h-10 text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            {passed ? 'مبروك! نجحت في الامتحان' : 'لم تنجح هذه المرة'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{selectedQuiz.title}</p>

          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{score}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">إجابات صحيحة</p>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">{questions.length - score}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">إجابات خاطئة</p>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <p className={`text-3xl font-bold ${passed ? 'text-emerald-500' : 'text-red-500'}`}>
                {percentage}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">النسبة</p>
            </div>
          </div>

          <div className="space-y-3 text-right mb-6">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const correct = userAnswer === q.correct_index;
              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border ${
                    correct
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {correct ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                        {idx + 1}. {q.question}
                      </p>
                      {!correct && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          الإجابة الصحيحة: {q.options[q.correct_index]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRetake}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            العودة لقائمة الامتحانات
          </button>
        </div>
      </div>
    );
  }

  // Taking quiz
  if (state === 'taking' && selectedQuiz) {
    const answeredCount = Object.keys(answers).length;
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Timer bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-500' : 'text-blue-500'}`} />
              <span className={`text-xl font-bold tabular-nums ${timeLeft < 60 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {answeredCount}/{questions.length} تم الإجابة
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timeLeft < 60 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${(timeLeft / (selectedQuiz.duration_minutes * 60)) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        {questions.map((q, idx) => {
          const selected = answers[q.id];
          return (
            <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 pt-0.5">
                  {q.question}
                </p>
              </div>
              <div className="space-y-2">
                {q.options.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => selectAnswer(q.id, optIdx)}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm transition-all border-2 ${
                      selected === optIdx
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                        : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300 hover:border-blue-200 dark:hover:border-blue-800'
                    }`}
                  >
                    <span className={`inline-block w-6 h-6 rounded-md text-xs leading-6 text-center ml-2 align-middle ${
                      selected === optIdx ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                    }`}>
                      {String.fromCharCode(1571 + optIdx)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <button
          onClick={handleSubmit}
          disabled={answeredCount < questions.length}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <CheckCircle className="w-5 h-5" />
          {answeredCount < questions.length
            ? `أجب على جميع الأسئلة (${answeredCount}/${questions.length})`
            : 'تسليم الامتحان'}
        </button>
      </div>
    );
  }

  // Quiz selection
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">مركز الامتحانات</h2>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        اختر امتحاناً لبدء الاختبار. سيكون هناك عداد تنازلي وتقييم فوري للإجابات.
      </p>

      <AdsterraAd />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse h-36 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700">
          <ClipboardList className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">لا توجد امتحانات متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  {quiz.duration_minutes} دقيقة
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{quiz.title}</h3>
              <p className="text-xs text-blue-500 font-medium mb-2">{quiz.subject}</p>
              {quiz.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  {quiz.description}
                </p>
              )}
              <button
                onClick={() => startQuiz(quiz)}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all group-hover:gap-3 disabled:opacity-50"
              >
                <span>بدء الامتحان</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
