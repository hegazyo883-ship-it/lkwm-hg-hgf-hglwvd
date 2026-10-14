import { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar, type PageId } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { HelpdeskButton } from '@/components/HelpdeskButton';
import { ThemeDecorations } from '@/components/ThemeDecorations';
import { Dashboard } from '@/pages/Dashboard';
import { AIChat } from '@/pages/AIChat';
import { QuizCenter } from '@/pages/QuizCenter';
import { StudyHub } from '@/pages/StudyHub';
import { CommunityFeed } from '@/pages/CommunityFeed';
import { AdminPanel } from '@/pages/AdminPanel';
import { GradeCalculator } from '@/pages/GradeCalculator';
import { StudySchedule } from '@/pages/StudySchedule';

function AppContent() {
  const [page, setPage] = useState<PageId>('dashboard');
  const { themeMode } = useApp();

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'chat': return <AIChat />;
      case 'quiz': return <QuizCenter />;
      case 'study': return <StudyHub />;
      case 'grades': return <GradeCalculator />;
      case 'schedule': return <StudySchedule />;
      case 'community': return <CommunityFeed />;
      case 'admin': return <AdminPanel />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" dir="rtl">
      <ThemeDecorations theme={themeMode} />
      <Sidebar currentPage={page} onNavigate={setPage} />

      <div className="lg:pr-72 flex min-h-screen flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-6xl mx-auto w-full">
          {renderPage()}
        </main>
        <Footer />
      </div>

      <HelpdeskButton />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
