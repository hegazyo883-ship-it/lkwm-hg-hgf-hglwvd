import { useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';

interface AdSlotProps {
  slot: 'header' | 'sidebar' | 'inline' | 'footer';
  className?: string;
}

export function AdSlot({ slot, className = '' }: AdSlotProps) {
  const { adsterraEnabled, adCodes } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptId = `ad-${slot}`;

  useEffect(() => {
    if (!adsterraEnabled || !adCodes[slot]) return;
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const code = adCodes[slot];
    const temp = document.createElement('div');
    temp.innerHTML = code;

    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        const script = document.createElement('script');
        const original = node as HTMLScriptElement;
        if (original.src) {
          script.src = original.src;
          script.async = true;
        } else {
          script.textContent = original.textContent;
        }
        if (original.type) script.type = original.type;
        container.appendChild(script);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    });
  }, [adsterraEnabled, adCodes, slot]);

  if (!adsterraEnabled) return null;

  const hasCode = Boolean(adCodes[slot]);
  const sizeClass =
    slot === 'header' ? 'min-h-[90px]' :
    slot === 'sidebar' ? 'min-h-[250px]' :
    slot === 'footer' ? 'min-h-[60px]' :
    'min-h-[100px]';

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-l from-slate-50 to-slate-100 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/50 p-3 text-center ${sizeClass} ${className}`}>
      <span className="absolute top-1 right-2 text-[10px] text-slate-400 dark:text-slate-500 z-10">إعلان</span>
      {hasCode ? (
        <div ref={containerRef} id={scriptId} className="flex items-center justify-center min-h-inherit w-full" />
      ) : (
        <div className="flex h-full items-center justify-center py-4">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400">
              <span className="text-sm font-bold text-white">Ad</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">مساحة إعلانية متاحة</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">أضف كود الإعلان من لوحة الإدارة</p>
          </div>
        </div>
      )}
    </div>
  );
}
