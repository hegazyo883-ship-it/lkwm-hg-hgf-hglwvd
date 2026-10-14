export const subjectMeta: Record<string, { icon: string; color: string; colorClass: string }> = {
  'اللغة العربية': { icon: 'BookOpen', color: '#3b82f6', colorClass: 'bg-blue-500' },
  'الفيزياء': { icon: 'Atom', color: '#8b5cf6', colorClass: 'bg-violet-500' },
  'الكيمياء': { icon: 'FlaskConical', color: '#10b981', colorClass: 'bg-emerald-500' },
  'الأحياء': { icon: 'Dna', color: '#f59e0b', colorClass: 'bg-amber-500' },
  'الإنجليزي': { icon: 'Languages', color: '#ef4444', colorClass: 'bg-red-500' },
};

export const subjects = Object.keys(subjectMeta);
