import { useApp } from '@/context/AppContext';

export function AdsterraAd() {
  const { adsterraEnabled } = useApp();
  if (!adsterraEnabled) return null;

  return (
    <div className="my-4 mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-l from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 p-4 text-center">
        <span className="absolute top-1 right-2 text-[10px] text-slate-400 dark:text-slate-500">
          إعلان
        </span>
        <div className="flex items-center justify-center gap-3 py-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Ad</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              مساحة إعلانية - Adsterra
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              يتم تفعيل الإعلانات من لوحة الإدارة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
