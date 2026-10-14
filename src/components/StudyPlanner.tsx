import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, CirclePause, CirclePlay, Clock3, Plus, RotateCcw, Target, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getSessionId } from '@/lib/storage';
import { subjects } from '@/lib/subjects';

interface StudySession {
  id: string;
  subject: string;
  title: string;
  duration_minutes: number;
  status: 'planned' | 'active' | 'completed';
  created_at: string;
  completed_at: string | null;
}

const durations = [25, 50, 90];

function startOfToday(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remaining = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}

export function StudyPlanner() {
  const sessionId = useMemo(() => getSessionId(), []);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subject, setSubject] = useState(subjects[0] || 'اللغة العربية');
  const [title, setTitle] = useState('مراجعة مركزة');
  const [duration, setDuration] = useState(25);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadSessions = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from('study_sessions')
      .select('id, subject, title, duration_minutes, status, created_at, completed_at')
      .eq('session_id', sessionId)
      .gte('created_at', startOfToday())
      .order('created_at', { ascending: true });

    if (loadError) {
      setError('تعذر تحميل خطة اليوم حالياً. حاول مرة أخرى.');
    } else {
      setSessions((data || []) as StudySession[]);
      const active = (data || []).find((item) => item.status === 'active');
      if (active && !activeId) {
        setActiveId(active.id);
        setRemainingSeconds(active.duration_minutes * 60);
      }
    }
    setLoading(false);
  }, [activeId, sessionId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!activeId || remainingSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeId, remainingSeconds]);

  useEffect(() => {
    if (!activeId || remainingSeconds !== 0) return;
    const finish = async () => {
      await supabase.from('study_sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', activeId).eq('session_id', sessionId);
      setActiveId(null);
      await loadSessions();
    };
    finish();
  }, [activeId, loadSessions, remainingSeconds, sessionId]);

  const completedCount = sessions.filter((item) => item.status === 'completed').length;
  const progress = sessions.length ? Math.round((completedCount / sessions.length) * 100) : 0;
  const activeSession = sessions.find((item) => item.id === activeId);

  const addSession = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    setError('');
    const { error: insertError } = await supabase.from('study_sessions').insert({
      session_id: sessionId,
      subject,
      title: title.trim(),
      duration_minutes: duration,
    });
    if (insertError) {
      setError('تعذر إضافة الجلسة. حاول مرة أخرى.');
    } else {
      setTitle('مراجعة مركزة');
      await loadSessions();
    }
    setSaving(false);
  };

  const startSession = async (item: StudySession) => {
    if (activeId && activeId !== item.id) return;
    await supabase.from('study_sessions').update({ status: 'active' }).eq('id', item.id).eq('session_id', sessionId);
    setActiveId(item.id);
    setRemainingSeconds(item.duration_minutes * 60);
    setSessions((current) => current.map((session) => session.id === item.id ? { ...session, status: 'active' } : session));
  };

  const pauseSession = async () => {
    if (!activeId) return;
    await supabase.from('study_sessions').update({ status: 'planned' }).eq('id', activeId).eq('session_id', sessionId);
    setSessions((current) => current.map((session) => session.id === activeId ? { ...session, status: 'planned' } : session));
    setActiveId(null);
    setRemainingSeconds(0);
  };

  const completeSession = async (id: string) => {
    await supabase.from('study_sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id).eq('session_id', sessionId);
    if (id === activeId) {
      setActiveId(null);
      setRemainingSeconds(0);
    }
    await loadSessions();
  };

  const deleteSession = async (id: string) => {
    if (id === activeId) await pauseSession();
    await supabase.from('study_sessions').delete().eq('id', id).eq('session_id', sessionId);
    await loadSessions();
  };

  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-l from-cyan-50 to-white p-5 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400">نظام الإنجاز اليومي</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">خطة مذاكرتك الذكية</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">قسّم يومك إلى جلسات قصيرة وركّز على إنجاز واحد في كل مرة.</p>
            </div>
          </div>
          <div className="min-w-[150px] rounded-xl bg-white/80 p-3 dark:bg-slate-900/40">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>إنجاز اليوم</span><span className="font-bold text-cyan-600">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div className="h-full rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          {activeSession && (
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900/60 dark:bg-cyan-900/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300">جلسة جارية الآن</p>
                  <p className="mt-1 font-bold text-slate-800 dark:text-white">{activeSession.title} · {activeSession.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold text-cyan-700 dark:text-cyan-300">{formatTimer(remainingSeconds)}</span>
                  <button onClick={pauseSession} className="rounded-xl bg-white p-2 text-cyan-700 shadow-sm hover:bg-cyan-100 dark:bg-slate-800 dark:text-cyan-300" aria-label="إيقاف الجلسة مؤقتاً">
                    <CirclePause className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
          {loading ? <div className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700" /> : sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
              <Clock3 className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">لم تضف جلسات اليوم بعد</p>
              <p className="mt-1 text-xs text-slate-400">أنشئ أول جلسة وابدأ بخطوة بسيطة.</p>
            </div>
          ) : sessions.map((item) => (
            <div key={item.id} className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${item.status === 'completed' ? 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-900/10' : 'border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800/40'}`}>
              <button onClick={() => completeSession(item.id)} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${item.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600 dark:bg-slate-700'}`} aria-label="تحديد الجلسة كمكتملة">
                <Check className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-bold ${item.status === 'completed' ? 'text-emerald-700 line-through dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{item.subject} · {item.duration_minutes} دقيقة</p>
              </div>
              {item.status !== 'completed' && <button onClick={() => startSession(item)} disabled={Boolean(activeId)} className="rounded-xl bg-cyan-50 p-2 text-cyan-600 transition-all hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-cyan-900/20 dark:text-cyan-300" aria-label="بدء الجلسة"><CirclePlay className="h-4 w-4" /></button>}
              {item.status === 'completed' && <RotateCcw className="h-4 w-4 text-emerald-500" />}
              <button onClick={() => deleteSession(item.id)} className="rounded-xl p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20" aria-label="حذف الجلسة"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
          <div className="mb-4 flex items-center gap-2"><Plus className="h-4 w-4 text-cyan-600" /><p className="text-sm font-bold text-slate-800 dark:text-white">جلسة جديدة</p></div>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">المادة<select value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white">{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">عنوان الجلسة<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="مثال: مراجعة الوحدة الأولى" /></label>
            <div><p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">مدة التركيز</p><div className="grid grid-cols-3 gap-2">{durations.map((item) => <button key={item} onClick={() => setDuration(item)} className={`rounded-xl px-2 py-2 text-xs font-bold transition-all ${duration === item ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'bg-white text-slate-500 hover:bg-cyan-50 dark:bg-slate-800 dark:text-slate-300'}`}>{item} د</button>)}</div></div>
            <button onClick={addSession} disabled={saving || !title.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-500 dark:hover:bg-cyan-400">{saving ? 'جارٍ الإضافة...' : 'إضافة إلى خطة اليوم'}<Plus className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
