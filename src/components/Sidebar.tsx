import { useState } from 'react';
import {
  LayoutDashboard,
  MessageCircle,
  ClipboardList,
  BookMarked,
  Users,
  Shield,
  Calculator,
  GraduationCap,
  CalendarDays,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export type PageId = 'dashboard' | 'chat' | 'quiz' | 'study' | 'grades' | 'schedule' | 'community' | 'admin';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'grades', label: 'حاسبة المجموع', icon: Calculator },
  { id: 'chat', label: 'المستشار الذكي', icon: MessageCircle },
  { id: 'quiz', label: 'مركز الامتحانات', icon: ClipboardList },
  { id: 'study', label: 'الملخصات والكتب', icon: BookMarked },
  { id: 'schedule', label: 'جدول المزاكرة', icon: CalendarDays },
  { id: 'community', label: 'ساحة المنشورات', icon: Users },
  { id: 'admin', label: 'لوحة الإدارة', icon: Shield },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { colorMode, toggleColorMode, siteName, siteSubtitle, faviconUrl } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (page: PageId) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 right-4 z-50 lg:hidden p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-lg text-slate-700 dark:text-slate-200"
        aria-label="فتح القائمة"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-screen w-72 z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col bg-white/95 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
          {/* Logo header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-l from-cyan-50/80 to-white dark:from-slate-900 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden shrink-0">
                {faviconUrl && faviconUrl.startsWith('data:') ? (
                  <img src={faviconUrl} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                  {siteName}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{siteSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-l from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-slate-800 hover:text-cyan-700 dark:hover:text-cyan-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                  {active && (
                    <span className="mr-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Dark mode toggle */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={toggleColorMode}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {colorMode === 'dark' ? (
                <>
                  <Sun className="w-5 h-5 text-amber-400" />
                  <span>الوضع النهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <span>الوضع الليلي</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
