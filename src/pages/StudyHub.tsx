import { useState } from 'react';
import {
  BookMarked,
  Landmark,
  BookOpen,
  FileText,
  Download,
  Folder,
  FolderOpen,
  File,
  FileType,
} from 'lucide-react';
import { bookFolders, downloadMockFile, type BookFile } from '@/lib/studyData';
import { AdsterraAd } from '@/components/AdsterraAd';

const iconMap: Record<string, typeof Landmark> = {
  Landmark,
  BookOpen,
  FileText,
};

function getFileIcon(file: BookFile) {
  if (file.type === 'doc') return FileType;
  return File;
}

export function StudyHub() {
  const [openFolder, setOpenFolder] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BookMarked className="w-6 h-6 text-emerald-500" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">الملخصات والكتب</h2>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        حمّل كتب الوزارة الرسمية والملخصات الدراسية لمراجعتها في أي وقت.
      </p>

      <AdsterraAd />

      <div className="grid gap-4 md:grid-cols-3">
        {bookFolders.map((folder, idx) => {
          const Icon = iconMap[folder.icon] || Folder;
          const isOpen = openFolder === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              {/* Folder header */}
              <button
                onClick={() => setOpenFolder(isOpen ? null : idx)}
                className="w-full p-5 text-right hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${folder.color} flex items-center justify-center shadow-md`}>
                    {isOpen ? <FolderOpen className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">{folder.title}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {folder.files.length} ملف
                    </p>
                  </div>
                </div>
              </button>

              {/* Files list */}
              {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-50 dark:divide-slate-700/50">
                  {folder.files.map((file, fIdx) => {
                    const FileIcon = getFileIcon(file);
                    return (
                      <div
                        key={fIdx}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          file.type === 'pdf' ? 'bg-red-100 dark:bg-red-900/30' :
                          file.type === 'doc' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-emerald-100 dark:bg-emerald-900/30'
                        }`}>
                          <FileIcon className={`w-4 h-4 ${
                            file.type === 'pdf' ? 'text-red-500' :
                            file.type === 'doc' ? 'text-blue-500' :
                            'text-emerald-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{file.size}</p>
                        </div>
                        <button
                          onClick={() => downloadMockFile(file.downloadName)}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group-hover:scale-110"
                          aria-label={`تحميل ${file.name}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
