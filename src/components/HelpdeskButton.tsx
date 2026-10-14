import { useState } from 'react';
import { Bug, X, Send } from 'lucide-react';

interface BugReport {
  id: string;
  page: string;
  description: string;
  created_at: string;
}

export function HelpdeskButton() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const report: BugReport = {
      id: crypto.randomUUID(),
      page: page.trim() || 'غير محدد',
      description: description.trim(),
      created_at: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('bug_reports') || '[]');
    existing.push(report);
    localStorage.setItem('bug_reports', JSON.stringify(existing));

    setSubmitted(true);
    setPage('');
    setDescription('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
        aria-label="الإبلاغ عن مشكلة"
      >
        <Bug className="w-5 h-5" />
        <span className="text-sm font-medium">الإبلاغ عن مشكلة</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Bug className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  الإبلاغ عن مشكلة
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                  <Send className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  تم إرسال بلاغك بنجاح
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  شكراً لمساعدتنا في تحسين المنصة
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    الصفحة التي حدثت بها المشكلة
                  </label>
                  <input
                    type="text"
                    value={page}
                    onChange={(e) => setPage(e.target.value)}
                    placeholder="مثال: لوحة التحكم، مركز الامتحانات..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    وصف المشكلة
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اشرح المشكلة بالتفصيل..."
                    rows={4}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all"
                >
                  <Send className="w-4 h-4" />
                  إرسال البلاغ
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
