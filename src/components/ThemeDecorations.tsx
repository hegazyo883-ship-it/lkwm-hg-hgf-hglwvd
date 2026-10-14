import { useState } from 'react';

const VALID_THEMES = [
  'ramadan', 'eid_fitr', 'eid_adha', 'mawlid',
  'october', 'sinai', 'republic', 'newyear',
  'mothersday', 'teachersday', 'nationalday',
];

export function ThemeDecorations({ theme }: { theme: string }) {
  if (!VALID_THEMES.includes(theme)) return null;

  switch (theme) {
    case 'ramadan': return <RamadanDecorations />;
    case 'eid_fitr': return <EidFitrDecorations />;
    case 'eid_adha': return <EidAdhaDecorations />;
    case 'mawlid': return <MawlidDecorations />;
    case 'october': return <OctoberDecorations />;
    case 'sinai': return <SinaiDecorations />;
    case 'republic': return <RepublicDecorations />;
    case 'newyear': return <NewYearDecorations />;
    case 'mothersday': return <MothersDayDecorations />;
    case 'teachersday': return <TeachersDayDecorations />;
    case 'nationalday': return <NationalDayDecorations />;
    default: return null;
  }
}

// ============ Ramadan ============
function RamadanDecorations() {
  const [lanterns] = useState<number[]>([0, 1, 2, 3, 4]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      <div className="absolute top-6 left-8 animate-float-slow">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-amber-200 dark:bg-amber-300 opacity-90" />
          <div className="absolute inset-0 rounded-full bg-amber-100 dark:bg-slate-900 translate-x-5 -translate-y-2 scale-95" />
        </div>
      </div>
      {lanterns.map((i) => (
        <div key={i} className="absolute animate-swing"
          style={{ left: `${8 + i * 19}%`, top: 0, animationDelay: `${i * 0.3}s`, animationDuration: `${2.5 + i * 0.5}s` }}>
          <div className="flex flex-col items-center">
            <div className="w-px h-8 bg-amber-400/50" />
            <div className="w-8 h-2 rounded-t-md bg-amber-500" />
            <div className="w-12 h-14 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 shadow-lg shadow-amber-500/50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-200 animate-pulse-glow" />
            </div>
            <div className="w-8 h-2 rounded-b-md bg-amber-700" />
            <div className="w-px h-4 bg-amber-500/70" />
            <div className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
        </div>
      ))}
      {[...Array(8)].map((_, i) => (
        <div key={`star-${i}`} className="absolute text-amber-300 animate-twinkle"
          style={{ left: `${5 + i * 12}%`, top: `${10 + (i % 3) * 20}%`, fontSize: '12px', animationDelay: `${i * 0.2}s` }}>
          ✦
        </div>
      ))}
    </div>
  );
}

// ============ Eid al-Fitr ============
function EidFitrDecorations() {
  const [items] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      {items.map((i) => (
        <div key={i} className="absolute animate-float-slow"
          style={{ left: `${5 + i * 16}%`, top: `${5 + (i % 2) * 15}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.3}s` }}>
          <div className="text-3xl">🌙</div>
        </div>
      ))}
      {[...Array(10)].map((_, i) => (
        <div key={`s-${i}`} className="absolute text-emerald-400 animate-twinkle"
          style={{ left: `${3 + i * 10}%`, top: `${15 + (i % 4) * 18}%`, fontSize: '14px', animationDelay: `${i * 0.15}s` }}>
          ✦
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-fade-in-slow">
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 opacity-70">
          🌙 عيد الفطر المبارك - كل عام وأنتم بخير 🌙
        </span>
      </div>
    </div>
  );
}

// ============ Eid al-Adha ============
function EidAdhaDecorations() {
  const [items] = useState<number[]>([0, 1, 2, 3, 4]);
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      {items.map((i) => (
        <div key={i} className="absolute animate-float-slow"
          style={{ left: `${8 + i * 18}%`, top: `${6 + (i % 2) * 14}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${3.5 + i * 0.4}s` }}>
          <div className="text-3xl">🕋</div>
        </div>
      ))}
      {[...Array(8)].map((_, i) => (
        <div key={`g-${i}`} className="absolute text-amber-500 animate-twinkle"
          style={{ left: `${4 + i * 12}%`, top: `${12 + (i % 3) * 22}%`, fontSize: '13px', animationDelay: `${i * 0.2}s` }}>
          ✦
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-fade-in-slow">
        <span className="text-sm font-bold text-amber-600 dark:text-amber-400 opacity-70">
          🕋 عيد الأضحى المبارك - تقبل الله طاعاتكم 🕋
        </span>
      </div>
    </div>
  );
}

// ============ Mawlid al-Nabawi ============
function MawlidDecorations() {
  const [items] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      {items.map((i) => (
        <div key={i} className="absolute animate-swing"
          style={{ left: `${6 + i * 15}%`, top: 0, animationDelay: `${i * 0.3}s`, animationDuration: `${3 + i * 0.4}s` }}>
          <div className="flex flex-col items-center">
            <div className="w-px h-6 bg-emerald-400/40" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/40 flex items-center justify-center">
              <span className="text-white text-sm font-bold">ﷺ</span>
            </div>
            <div className="w-px h-3 bg-emerald-400/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      ))}
      {[...Array(8)].map((_, i) => (
        <div key={`m-${i}`} className="absolute text-emerald-400 animate-twinkle"
          style={{ left: `${4 + i * 12}%`, top: `${18 + (i % 3) * 20}%`, fontSize: '12px', animationDelay: `${i * 0.25}s` }}>
          ✦
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-fade-in-slow">
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 opacity-70">
          🕌 المولد النبوي الشريف - صلى الله عليه وسلم 🕌
        </span>
      </div>
    </div>
  );
}

// ============ October Victory ============
function OctoberDecorations() {
  const [flags] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      {flags.map((i) => (
        <div key={i} className="absolute animate-wave"
          style={{ left: `${5 + i * 16}%`, top: `${8 + (i % 2) * 12}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.3}s` }}>
          <div className="flex flex-col items-center">
            <div className="w-px h-6 bg-slate-400/50" />
            <div className="w-16 h-10 rounded-sm shadow-lg overflow-hidden flex flex-col">
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-white flex items-center justify-center">
                <span className="text-amber-500 text-xs font-bold">★</span>
              </div>
              <div className="flex-1 bg-black" />
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-fade-in-slow">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 opacity-60">
          🇪🇬 الذكرى السنوية لنصر أكتوبر 🇪🇬
        </span>
      </div>
    </div>
  );
}

// ============ Sinai Liberation Day (April 25) ============
function SinaiDecorations() {
  const [items] = useState<number[]>([0, 1, 2, 3, 4]);
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      {items.map((i) => (
        <div key={i} className="absolute animate-wave"
          style={{ left: `${6 + i * 18}%`, top: `${8 + (i % 2) * 14}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.3}s` }}>
          <div className="flex flex-col items-center">
            <div className="w-px h-6 bg-slate-400/50" />
            <div className="w-14 h-9 rounded-sm shadow-lg overflow-hidden flex flex-col">
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-white flex items-center justify-center">
                <span className="text-amber-500 text-[10px] font-bold">★</span>
              </div>
              <div className="flex-1 bg-black" />
            </div>
          </div>
        </div>
      ))}
      {items.map((i) => (
        <div key={`d-${i}`} className="absolute animate-float-slow"
          style={{ left: `${10 + i * 20}%`, top: `${35 + (i % 2) * 20}%`, animationDelay: `${i * 0.6}s`, animationDuration: `${4 + i * 0.3}s` }}>
          <div className="text-2xl">🏜️</div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-fade-in-slow">
        <span className="text-sm font-bold text-amber-600 dark:text-amber-400 opacity-70">
          🇪🇬 عيد تحرير سيناء - 25 أبريل 🇪🇬
        </span>
      </div>
    </div>
  );
}

// ============ Republic Declaration Day (July 23) ============
function RepublicDecorations() {
  const [flags] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      {flags.map((i) => (
        <div key={i} className="absolute animate-wave"
          style={{ left: `${4 + i * 16}%`, top: `${6 + (i % 2) * 16}%`, animationDelay: `${i * 0.3}s`, animationDuration: `${2.8 + i * 0.3}s` }}>
          <div className="flex flex-col items-center">
            <div className="w-px h-6 bg-slate-400/50" />
            <div className="w-16 h-10 rounded-sm shadow-lg overflow-hidden flex flex-col">
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-white flex items-center justify-center">
                <span className="text-amber-500 text-xs font-bold">★</span>
              </div>
              <div className="flex-1 bg-black" />
            </div>
          </div>
        </div>
      ))}
      {[...Array(6)].map((_, i) => (
        <div key={`f-${i}`} className="absolute animate-float-slow"
          style={{ left: `${8 + i * 15}%`, top: `${40 + (i % 2) * 15}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${3.5 + i * 0.3}s` }}>
          <div className="text-2xl"> ⭐</div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-fade-in-slow">
        <span className="text-sm font-bold text-red-600 dark:text-red-400 opacity-70">
          🇪🇬 ثورة 23 يوليو - يوم إعلان الجمهورية 🇪🇬
        </span>
      </div>
    </div>
  );
}

// ============ New Year ============
function NewYearDecorations() {
  const [items] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      {items.map((i) => (
        <div key={i} className="absolute animate-float-slow"
          style={{ left: `${5 + i * 13}%`, top: `${8 + (i % 3) * 18}%`, animationDelay: `${i * 0.3}s`, animationDuration: `${2.5 + i * 0.4}s` }}>
          <div className="text-2xl">✨</div>
        </div>
      ))}
      {[...Array(8)].map((_, i) => (
        <div key={`c-${i}`} className="absolute animate-twinkle"
          style={{ left: `${4 + i * 12}%`, top: `${10 + (i % 4) * 18}%`, fontSize: '16px', animationDelay: `${i * 0.2}s` }}>
          {i % 2 === 0 ? '🎆' : '🎇'}
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-fade-in-slow">
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 opacity-70">
          ✨ رأس السنة الميلادية - عام سعيد ✨
        </span>
      </div>
    </div>
  );
}

// ============ Mother's Day (March 21) ============
function MothersDayDecorations() {
  const [items] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      {items.map((i) => (
        <div key={i} className="absolute animate-float-slow"
          style={{ left: `${5 + i * 15}%`, top: `${8 + (i % 2) * 16}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.3}s` }}>
          <div className="text-3xl">🌸</div>
        </div>
      ))}
      {[...Array(8)].map((_, i) => (
        <div key={`r-${i}`} className="absolute animate-float-slow"
          style={{ left: `${8 + i * 11}%`, top: `${30 + (i % 3) * 15}%`, animationDelay: `${i * 0.25}s`, animationDuration: `${2.5 + i * 0.3}s` }}>
          <div className="text-xl">🌷</div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-fade-in-slow">
        <span className="text-sm font-bold text-pink-600 dark:text-pink-400 opacity-70">
          🌸 عيد الأم - كل عام وأمهاتنا بخير 🌸
        </span>
      </div>
    </div>
  );
}

// ============ Teacher's Day (May 13) ============
function TeachersDayDecorations() {
  const [items] = useState<number[]>([0, 1, 2, 3, 4]);
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      {items.map((i) => (
        <div key={i} className="absolute animate-float-slow"
          style={{ left: `${6 + i * 18}%`, top: `${8 + (i % 2) * 15}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.3}s` }}>
          <div className="text-3xl">🍎</div>
        </div>
      ))}
      {[...Array(6)].map((_, i) => (
        <div key={`b-${i}`} className="absolute animate-swing"
          style={{ left: `${10 + i * 15}%`, top: 0, animationDelay: `${i * 0.3}s`, animationDuration: `${2.5 + i * 0.4}s` }}>
          <div className="flex flex-col items-center">
            <div className="w-px h-5 bg-blue-400/40" />
            <div className="text-2xl">📚</div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-fade-in-slow">
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 opacity-70">
          🍎 عيد المعلم - شكراً لمعلمينا 🍎
        </span>
      </div>
    </div>
  );
}

// ============ National Day (Police Day - Jan 25) ============
function NationalDayDecorations() {
  const [items] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
      {items.map((i) => (
        <div key={i} className="absolute animate-wave"
          style={{ left: `${5 + i * 16}%`, top: `${8 + (i % 2) * 14}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.3}s` }}>
          <div className="flex flex-col items-center">
            <div className="w-px h-6 bg-slate-400/50" />
            <div className="w-14 h-9 rounded-sm shadow-lg overflow-hidden flex flex-col">
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-white flex items-center justify-center">
                <span className="text-amber-500 text-[10px] font-bold">★</span>
              </div>
              <div className="flex-1 bg-black" />
            </div>
          </div>
        </div>
      ))}
      {[...Array(5)].map((_, i) => (
        <div key={`s-${i}`} className="absolute animate-float-slow"
          style={{ left: `${10 + i * 20}%`, top: `${35 + (i % 2) * 18}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${3.5 + i * 0.3}s` }}>
          <div className="text-2xl">🛡️</div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-fade-in-slow">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 opacity-60">
          🇪🇬 عيد الشرطة - 25 يناير 🇪🇬
        </span>
      </div>
    </div>
  );
}
