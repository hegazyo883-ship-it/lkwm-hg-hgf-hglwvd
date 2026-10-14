import { useState, useMemo } from 'react';
import { Calculator, RotateCcw, Award, TrendingUp, Info, FlaskRound, Sigma, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';

type SectionId = 'science' | 'math' | 'literary';

interface SubjectConfig {
  name: string;
  max: number;
  pass: number;
  subFields?: { label: string; max: number }[];
}

interface SectionConfig {
  id: SectionId;
  label: string;
  icon: typeof FlaskRound;
  gradient: string;
  subjects: SubjectConfig[];
}

const COMMON_SUBJECTS: SubjectConfig[] = [
  { name: 'اللغة العربية', max: 80, pass: 40 },
  { name: 'اللغة الأجنبية الأولى', max: 60, pass: 30 },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'science',
    label: 'علمي علوم',
    icon: FlaskRound,
    gradient: 'from-emerald-500 to-teal-500',
    subjects: [
      { name: 'الأحياء', max: 60, pass: 30 },
      { name: 'الفيزياء', max: 60, pass: 30 },
      { name: 'الكيمياء', max: 60, pass: 30 },
    ],
  },
  {
    id: 'math',
    label: 'علمي رياضيات',
    icon: Sigma,
    gradient: 'from-blue-500 to-cyan-500',
    subjects: [
      { name: 'الإنجليزي', max: 60, pass: 30 },
      { name: 'الفيزياء', max: 60, pass: 30 },
      { name: 'الكيمياء', max: 60, pass: 30 },
    ],
  },
  {
    id: 'literary',
    label: 'أدبي',
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-500',
    subjects: [
      { name: 'التاريخ', max: 60, pass: 30 },
      { name: 'الجغرافيا', max: 60, pass: 30 },
      { name: 'الإحصاء', max: 60, pass: 30 },
    ],
  },
];

const MAX_TOTAL = 320;

interface GradeEntry {
  subject: string;
  value: string;
  subValues?: string[];
  max: number;
  pass: number;
  total: number;
  subFields?: { label: string; max: number }[];
}

function buildEntries(section: SectionConfig): GradeEntry[] {
  const all = [...COMMON_SUBJECTS, ...section.subjects];
  return all.map((s) => ({
    subject: s.name,
    value: '',
    subValues: s.subFields ? s.subFields.map(() => '') : undefined,
    max: s.max,
    pass: s.pass,
    total: 0,
    subFields: s.subFields,
  }));
}

function clampStr(value: string, max: number): number {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) return 0;
  return Math.min(num, max);
}

export function GradeCalculator() {
  const [sectionId, setSectionId] = useState<SectionId>('science');
  const [entriesMap, setEntriesMap] = useState<Record<SectionId, GradeEntry[]>>(() => ({
    science: buildEntries(SECTIONS[0]),
    math: buildEntries(SECTIONS[1]),
    literary: buildEntries(SECTIONS[2]),
  }));

  const section = SECTIONS.find((s) => s.id === sectionId)!;
  const entries = entriesMap[sectionId];

  const updateValue = (idx: number, value: string) => {
    setEntriesMap((prev) => {
      const list = [...prev[sectionId]];
      const item = { ...list[idx] };
      item.value = value;
      item.total = clampStr(value, item.max);
      list[idx] = item;
      return { ...prev, [sectionId]: list };
    });
  };

  const updateSubValue = (idx: number, subIdx: number, value: string) => {
    setEntriesMap((prev) => {
      const list = [...prev[sectionId]];
      const item = { ...list[idx] };
      const subValues = [...(item.subValues || [])];
      subValues[subIdx] = value;
      item.subValues = subValues;
      const subMaxes = item.subFields || [];
      item.total = subValues.reduce((sum, v, i) => sum + clampStr(v, subMaxes[i]?.max || 0), 0);
      item.value = item.total.toString();
      list[idx] = item;
      return { ...prev, [sectionId]: list };
    });
  };

  const { grandTotal, percentage, rank, failedSubjects } = useMemo(() => {
    const total = entries.reduce((sum, g) => sum + g.total, 0);
    const pct = (total / MAX_TOTAL) * 100;
    const failed = entries.filter((g) => g.value !== '' && g.total < g.pass);
    let estimatedRank = 'لم يُحدد بعد';
    if (failed.length > 0) {
      estimatedRank = `دور ثانٍ (${failed.length} مادة رسب)`;
    } else if (pct >= 95) estimatedRank = 'الأول على الجمهورية (محتمل)';
    else if (pct >= 90) estimatedRank = 'من الأوائل (Top 1%)';
    else if (pct >= 80) estimatedRank = 'ممتاز (Top 10%)';
    else if (pct >= 70) estimatedRank = 'جيد جداً';
    else if (pct >= 60) estimatedRank = 'جيد';
    else if (pct >= 50) estimatedRank = 'مقبول';
    else if (total > 0) estimatedRank = 'يحتاج تحسين';
    return { grandTotal: total, percentage: pct, rank: estimatedRank, failedSubjects: failed };
  }, [entries]);

  const reset = () => {
    setEntriesMap((prev) => ({ ...prev, [sectionId]: buildEntries(section) }));
  };

  const isComplete = entries.every((g) => {
    if (g.subValues) return g.subValues.every((v) => v !== '');
    return g.value !== '';
  });

  const commonEntries = entries.slice(0, COMMON_SUBJECTS.length);
  const sectionEntries = entries.slice(COMMON_SUBJECTS.length);

  const renderEntry = (g: GradeEntry, idx: number) => {
    const isFilled = g.value !== '' || (g.subValues && g.subValues.some((v) => v !== ''));
    const isPassed = g.total >= g.pass;
    const showPassStatus = g.value !== '';

    return (
      <div
        key={g.subject}
        className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800 dark:text-white">{g.subject}</span>
          <div className="flex items-center gap-2">
            {showPassStatus && (
              isPassed ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> ناجح
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                  <XCircle className="h-3.5 w-3.5" /> راسب
                </span>
              )
            )}
            <span className={`text-xs font-bold ${isFilled && isPassed ? 'text-emerald-600' : isFilled ? 'text-red-500' : 'text-slate-400'}`}>
              {g.total} / {g.max}
            </span>
          </div>
        </div>

        {g.subFields ? (
          <div className="grid grid-cols-2 gap-2">
            {g.subFields.map((sf, subIdx) => (
              <label key={subIdx} className="block">
                <span className="mb-1 block text-[10px] font-medium text-slate-400">
                  {sf.label} ({sf.max})
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={g.subValues?.[subIdx] || ''}
                  onChange={(e) => updateSubValue(idx, subIdx, e.target.value)}
                  placeholder="0"
                  max={sf.max}
                  min={0}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-center text-sm text-slate-800 outline-none focus:border-cyan-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </label>
            ))}
          </div>
        ) : (
          <label className="block">
            <span className="mb-1 block text-[10px] font-medium text-slate-400">
              الدرجة (النجاح: {g.pass})
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={g.value}
              onChange={(e) => updateValue(idx, e.target.value)}
              placeholder="0"
              max={g.max}
              min={0}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-center text-sm text-slate-800 outline-none focus:border-cyan-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-cyan-600">أداة شائعة لكل الطلاب</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">حاسبة مجموع الثانوية العامة</h1>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            اختر الشعبة ثم أدخل درجاتك لمعرفة مجموعك الكلي من 320 ونسبتك وتقديرك.
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <RotateCcw className="h-4 w-4" /> تصفير
        </button>
      </div>

      <AdSlot slot="header" />

      {/* Section selector */}
      <div className="grid grid-cols-3 gap-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = sectionId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSectionId(s.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                active
                  ? `border-transparent bg-gradient-to-br ${s.gradient} text-white shadow-lg`
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <Icon className={`h-6 w-6 ${active ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-sm font-bold">{s.label}</span>
              <span className={`text-[10px] ${active ? 'text-white/80' : 'text-slate-400'}`}>مجموع 320</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {/* Common subjects */}
          <div className="surface-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-cyan-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">المواد المشتركة</h2>
                <p className="text-xs text-slate-400">المجموع: 140 درجة — تُضاف لجميع الطلاب</p>
              </div>
            </div>
            <div className="space-y-3">
              {commonEntries.map((g, i) => renderEntry(g, i))}
            </div>
          </div>

          {/* Section-specific subjects */}
          <div className="surface-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <section.icon className="h-5 w-5 text-cyan-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  مواد شعبة {section.label}
                </h2>
                <p className="text-xs text-slate-400">المجموع: 180 درجة</p>
              </div>
            </div>
            <div className="space-y-3">
              {sectionEntries.map((g, i) => renderEntry(g, i + COMMON_SUBJECTS.length))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card overflow-hidden">
            <div className={`bg-gradient-to-l ${section.gradient} p-5 text-white`}>
              <p className="text-xs font-medium text-white/80">المجموع الكلي</p>
              <p className="mt-1 text-3xl font-bold">
                {grandTotal}
                <span className="text-lg font-normal text-white/70"> / {MAX_TOTAL}</span>
              </p>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>النسبة المئوية</span>
                  <span className="font-bold text-cyan-600">{percentage.toFixed(2)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full bg-gradient-to-l ${section.gradient} transition-all duration-700`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <div className="mb-1 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-cyan-500" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">التقدير المتوقع</span>
                </div>
                <p className={`text-sm font-bold ${isComplete ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {rank}
                </p>
              </div>

              {failedSubjects.length > 0 && (
                <div className="mt-3 rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
                  <p className="mb-1 text-xs font-bold text-red-600">مواد تحتاج دور ثانٍ:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {failedSubjects.map((f) => (
                      <span key={f.subject} className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        {f.subject} ({f.total}/{f.max})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <AdSlot slot="sidebar" />

          <div className="surface-card flex items-start gap-2 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              هذه الحاسبة تعطي تقديراً مبدئياً للمجموع والنسبة. الدرجات الفعلية وقواعد النجاح تخضع لقواعد وزارة التربية والتعليم وقد تختلف حسب السنة.
            </p>
          </div>
        </div>
      </div>

      <AdSlot slot="inline" />

      <AdSlot slot="footer" />
    </div>
  );
}
