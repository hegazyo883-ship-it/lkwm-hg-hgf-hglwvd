import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Sparkles,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Save,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getSessionId } from '@/lib/storage';
import { subjects } from '@/lib/subjects';
import { AdSlot } from '@/components/AdSlot';

interface ScheduleEntry {
  id: string;
  session_id: string;
  day_of_week: number;
  entry_type: 'lesson' | 'prayer';
  label: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

const DAYS = [
  { index: 0, name: 'السبت' },
  { index: 1, name: 'الأحد' },
  { index: 2, name: 'الإثنين' },
  { index: 3, name: 'الثلاثاء' },
  { index: 4, name: 'الأربعاء' },
  { index: 5, name: 'الخميس' },
  { index: 6, name: 'الجمعة' },
];

const PRAYER_ICONS: Record<string, typeof Sunrise> = {
  'صلاة الفجر': Sunrise,
  'صلاة الظهر': Sun,
  'صلاة العصر': Sunset,
  'صلاة المغرب': Moon,
  'صلاة العشاء': Moon,
};

const DEFAULT_PRAYERS = [
  { label: 'صلاة الفجر', start_time: '04:30', end_time: '05:00' },
  { label: 'صلاة الظهر', start_time: '12:00', end_time: '12:30' },
  { label: 'صلاة العصر', start_time: '15:30', end_time: '16:00' },
  { label: 'صلاة المغرب', start_time: '18:00', end_time: '18:30' },
  { label: 'صلاة العشاء', start_time: '19:30', end_time: '20:00' },
];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToLabel(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h < 12 ? 'ص' : 'م';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

export function StudySchedule() {
  const sessionId = useMemo(() => getSessionId(), []);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);

  // form state
  const [lessonSubject, setLessonSubject] = useState(subjects[0] || 'اللغة العربية');
  const [lessonStart, setLessonStart] = useState('09:00');
  const [lessonEnd, setLessonEnd] = useState('10:30');

  // prayer form state
  const [prayerName, setPrayerName] = useState('صلاة الفجر');
  const [prayerStart, setPrayerStart] = useState('04:30');
  const [prayerEnd, setPrayerEnd] = useState('05:00');

  const [showGenerated, setShowGenerated] = useState(false);

  const loadEntries = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from('study_schedule')
      .select('*')
      .eq('session_id', sessionId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (loadError) {
      setError('تعذر تحميل الجدول حالياً. حاول مرة أخرى.');
    } else {
      setEntries((data || []) as ScheduleEntry[]);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const addLesson = async () => {
    if (lessonStart >= lessonEnd) {
      setError('وقت بداية الدرس يجب أن يكون قبل وقت النهاية.');
      return;
    }
    setError('');
    const { error: insertError } = await supabase.from('study_schedule').insert({
      session_id: sessionId,
      day_of_week: selectedDay,
      entry_type: 'lesson',
      label: lessonSubject,
      start_time: lessonStart,
      end_time: lessonEnd,
    });
    if (insertError) {
      setError('تعذر إضافة الدرس. حاول مرة أخرى.');
    } else {
      await loadEntries();
    }
  };

  const addPrayer = async () => {
    if (prayerStart >= prayerEnd) {
      setError('وقت بداية الصلاة يجب أن يكون قبل وقت النهاية.');
      return;
    }
    setError('');
    const { error: insertError } = await supabase.from('study_schedule').insert({
      session_id: sessionId,
      day_of_week: selectedDay,
      entry_type: 'prayer',
      label: prayerName,
      start_time: prayerStart,
      end_time: prayerEnd,
    });
    if (insertError) {
      setError('تعذر إضافة وقت الصلاة. حاول مرة أخرى.');
    } else {
      await loadEntries();
    }
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('study_schedule').delete().eq('id', id).eq('session_id', sessionId);
    await loadEntries();
  };

  const clearDay = async () => {
    if (!confirm('هل تريد مسح كل مواعيد هذا اليوم؟')) return;
    await supabase
      .from('study_schedule')
      .delete()
      .eq('session_id', sessionId)
      .eq('day_of_week', selectedDay);
    await loadEntries();
  };

  const fillDefaultPrayers = async () => {
    const rows = DEFAULT_PRAYERS.map((p) => ({
      session_id: sessionId,
      day_of_week: selectedDay,
      entry_type: 'prayer' as const,
      label: p.label,
      start_time: p.start_time,
      end_time: p.end_time,
    }));
    await supabase.from('study_schedule').insert(rows);
    await loadEntries();
  };

  // Auto-generate a balanced study schedule across all days
  const generateSchedule = async () => {
    if (!confirm('سيتم إنشاء جدول مذاكرة تلقائي لكل أيام الأسبوع. سيتم استبدال أي جدول حالي. هل تريد المتابعة؟')) return;

    // Clear existing entries
    await supabase.from('study_schedule').delete().eq('session_id', sessionId);

    const rows: Array<{
      session_id: string;
      day_of_week: number;
      entry_type: 'lesson' | 'prayer';
      label: string;
      start_time: string;
      end_time: string;
    }> = [];

    // Study slots between prayers
    const studySlots = [
      { start: '05:00', end: '07:00', subjectIdx: 0 },
      { start: '07:00', end: '08:30', subjectIdx: 1 },
      { start: '09:00', end: '11:00', subjectIdx: 2 },
      { start: '12:30', end: '14:30', subjectIdx: 3 },
      { start: '16:00', end: '18:00', subjectIdx: 4 },
      { start: '20:00', end: '22:00', subjectIdx: 0 },
    ];

    for (let day = 0; day < 7; day++) {
      // Friday: prayers only + light study
      const isFriday = day === 6;

      // Add prayers for every day
      for (const p of DEFAULT_PRAYERS) {
        rows.push({
          session_id: sessionId,
          day_of_week: day,
          entry_type: 'prayer',
          label: p.label,
          start_time: p.start_time,
          end_time: p.end_time,
        });
      }

      if (!isFriday) {
        for (const slot of studySlots) {
          const subj = subjects[slot.subjectIdx % subjects.length] || 'مراجعة عامة';
          rows.push({
            session_id: sessionId,
            day_of_week: day,
            entry_type: 'lesson',
            label: subj,
            start_time: slot.start,
            end_time: slot.end,
          });
        }
      } else {
        // Friday: one study session after Asr
        rows.push({
          session_id: sessionId,
          day_of_week: day,
          entry_type: 'lesson',
          label: 'مراجعة خفيفة',
          start_time: '16:00',
          end_time: '18:00',
        });
      }
    }

    const { error: insertError } = await supabase.from('study_schedule').insert(rows);
    if (insertError) {
      setError('تعذر إنشاء الجدول التلقائي. حاول مرة أخرى.');
    } else {
      setShowGenerated(true);
      await loadEntries();
    }
  };

  const dayEntries = useMemo(
    () => entries.filter((e) => e.day_of_week === selectedDay).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [entries, selectedDay],
  );

  // Build a merged timeline for the selected day
  const timeline = useMemo(() => {
    return dayEntries.map((e) => ({
      ...e,
      startMin: timeToMinutes(e.start_time),
      endMin: timeToMinutes(e.end_time),
    }));
  }, [dayEntries]);

  const totalStudyMinutes = useMemo(
    () =>
      timeline
        .filter((e) => e.entry_type === 'lesson')
        .reduce((sum, e) => sum + (e.endMin - e.startMin), 0),
    [timeline],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-1">نظّم وقتك بين الدراسة والعبادة</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">جدول المزاكرة</h1>
        </div>
        <button
          onClick={generateSchedule}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-600"
        >
          <Sparkles className="h-5 w-5" />
          إنشاء جدول تلقائي
        </button>
      </div>

      <AdSlot slot="header" />

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {showGenerated && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          <Sparkles className="h-4 w-4 shrink-0" />
          تم إنشاء جدول مذاكرة تلقائي لكل أيام الأسبوع!
          <button onClick={() => setShowGenerated(false)} className="mr-auto text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
            حسناً
          </button>
        </div>
      )}

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {DAYS.map((day) => (
          <button
            key={day.index}
            onClick={() => setSelectedDay(day.index)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              selectedDay === day.index
                ? 'bg-gradient-to-l from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-cyan-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            {day.name}
          </button>
        ))}
      </div>

      {/* Add forms */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Add lesson */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">إضافة درس</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">حدد المادة ووقت الدرس</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              المادة
              <select
                value={lessonSubject}
                onChange={(e) => setLessonSubject(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-700/50 dark:text-white"
              >
                {subjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                من
                <input
                  type="time"
                  value={lessonStart}
                  onChange={(e) => setLessonStart(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-700/50 dark:text-white"
                />
              </label>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                إلى
                <input
                  type="time"
                  value={lessonEnd}
                  onChange={(e) => setLessonEnd(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-700/50 dark:text-white"
                />
              </label>
            </div>
            <button
              onClick={addLesson}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              إضافة الدرس
            </button>
          </div>
        </div>

        {/* Add prayer */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Sun className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">إضافة وقت صلاة</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">حدد الصلاة ووقتها</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              الصلاة
              <select
                value={prayerName}
                onChange={(e) => setPrayerName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-700/50 dark:text-white"
              >
                {Object.keys(PRAYER_ICONS).map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                من
                <input
                  type="time"
                  value={prayerStart}
                  onChange={(e) => setPrayerStart(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-700/50 dark:text-white"
                />
              </label>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                إلى
                <input
                  type="time"
                  value={prayerEnd}
                  onChange={(e) => setPrayerEnd(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-700/50 dark:text-white"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addPrayer}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4" />
                إضافة
              </button>
              <button
                onClick={fillDefaultPrayers}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                title="إضافة الصلوات الخمس بأوقات افتراضية"
              >
                <Sun className="h-4 w-4" />
                الصلوات الخمس
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule timeline for selected day */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              جدول {DAYS.find((d) => d.index === selectedDay)?.name}
            </h3>
            {totalStudyMinutes > 0 && (
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
                {Math.floor(totalStudyMinutes / 60)} ساعة {totalStudyMinutes % 60} دقيقة مذاكرة
              </span>
            )}
          </div>
          {dayEntries.length > 0 && (
            <button
              onClick={clearDay}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              مسح اليوم
            </button>
          )}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700" />
              ))}
            </div>
          ) : timeline.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">لا يوجد جدول لهذا اليوم</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">أضف دروساً وأوقات صلاة، أو استخدم "إنشاء جدول تلقائي"</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {timeline.map((entry) => {
                const isLesson = entry.entry_type === 'lesson';
                const PrayerIcon = PRAYER_ICONS[entry.label];
                return (
                  <div
                    key={entry.id}
                    className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${
                      isLesson
                        ? 'border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10'
                        : 'border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10'
                    }`}
                  >
                    {/* Time badge */}
                    <div
                      className={`flex w-20 shrink-0 flex-col items-center rounded-lg py-2 text-center ${
                        isLesson
                          ? 'bg-blue-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight">{minutesToLabel(entry.startMin)}</span>
                      <span className="text-[10px] opacity-80 leading-tight">{minutesToLabel(entry.endMin)}</span>
                    </div>

                    {/* Icon + label */}
                    <div className="flex flex-1 items-center gap-3">
                      {isLesson ? (
                        <BookOpen className={`h-5 w-5 ${isLesson ? 'text-blue-500' : 'text-emerald-500'}`} />
                      ) : PrayerIcon ? (
                        <PrayerIcon className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Sun className="h-5 w-5 text-emerald-500" />
                      )}
                      <div>
                        <p className={`text-sm font-bold ${isLesson ? 'text-blue-800 dark:text-blue-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
                          {entry.label}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {entry.endMin - entry.startMin} دقيقة
                        </p>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="rounded-lg p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Weekly overview */}
      {!loading && entries.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">نظرة أسبوعية</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {DAYS.map((day) => {
              const dayItems = entries.filter((e) => e.day_of_week === day.index);
              const studyCount = dayItems.filter((e) => e.entry_type === 'lesson').length;
              const prayerCount = dayItems.filter((e) => e.entry_type === 'prayer').length;
              const isActive = dayItems.length > 0;
              return (
                <button
                  key={day.index}
                  onClick={() => setSelectedDay(day.index)}
                  className={`rounded-xl border p-3 text-center transition-all ${
                    selectedDay === day.index
                      ? 'border-cyan-400 bg-cyan-50 dark:border-cyan-600 dark:bg-cyan-900/20'
                      : isActive
                        ? 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50'
                        : 'border-dashed border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{day.name}</p>
                  <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                    {studyCount > 0 && (
                      <span className="flex items-center gap-1 text-blue-500">
                        <BookOpen className="h-3 w-3" />
                        {studyCount}
                      </span>
                    )}
                    {prayerCount > 0 && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <Sun className="h-3 w-3" />
                        {prayerCount}
                      </span>
                    )}
                    {dayItems.length === 0 && (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <AdSlot slot="footer" />
    </div>
  );
}
