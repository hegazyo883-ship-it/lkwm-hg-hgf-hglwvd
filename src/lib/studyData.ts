export interface BookFile {
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'summary';
  downloadName: string;
}

export interface BookFolder {
  title: string;
  icon: string;
  subject: string;
  color: string;
  files: BookFile[];
}

export const bookFolders: BookFolder[] = [
  {
    title: 'كتب وزارة التربية والتعليم',
    icon: 'Landmark',
    subject: 'الوزارة',
    color: 'from-blue-500 to-blue-700',
    files: [
      { name: 'اللغة العربية - الجزء الأول.pdf', size: '12.4 MB', type: 'pdf', downloadName: 'arabic_part1.pdf' },
      { name: 'اللغة العربية - الجزء الثاني.pdf', size: '10.8 MB', type: 'pdf', downloadName: 'arabic_part2.pdf' },
      { name: 'الفيزياء - منهج كامل.pdf', size: '15.2 MB', type: 'pdf', downloadName: 'physics_full.pdf' },
      { name: 'الكيمياء - منهج كامل.pdf', size: '14.1 MB', type: 'pdf', downloadName: 'chemistry_full.pdf' },
      { name: 'الأحياء - منهج كامل.pdf', size: '18.6 MB', type: 'pdf', downloadName: 'biology_full.pdf' },
      { name: 'الإنجليزي - منهج كامل.pdf', size: '16.3 MB', type: 'pdf', downloadName: 'english_full.pdf' },
    ],
  },
  {
    title: 'ملخص النحو الوافي',
    icon: 'BookOpen',
    subject: 'النحو',
    color: 'from-emerald-500 to-emerald-700',
    files: [
      { name: 'ملخص النحو الوافي - كامل.pdf', size: '3.2 MB', type: 'summary', downloadName: 'nahu_summary_full.pdf' },
      { name: 'ملخص النحو الوافي - المبني للمجهول.doc', size: '1.1 MB', type: 'doc', downloadName: 'nahu_passive.doc' },
      { name: 'ملخص النحو الوافي - المنصوبات.pdf', size: '2.4 MB', type: 'summary', downloadName: 'nahu_mansoubat.pdf' },
      { name: 'ملخص النحو الوافي - المرفوعات.pdf', size: '2.1 MB', type: 'summary', downloadName: 'nahu_marfouat.pdf' },
    ],
  },
  {
    title: 'ملخصات إضافية',
    icon: 'FileText',
    subject: 'ملخصات',
    color: 'from-amber-500 to-amber-700',
    files: [
      { name: 'ملخص الفيزياء - الحركة والموجات.pdf', size: '1.8 MB', type: 'summary', downloadName: 'physics_waves_summary.pdf' },
      { name: 'ملخص الكيمياء - التفاعلات الكيميائية.pdf', size: '1.5 MB', type: 'summary', downloadName: 'chemistry_reactions_summary.pdf' },
      { name: 'ملخص الأحياء - الوراثة.pdf', size: '2.0 MB', type: 'summary', downloadName: 'biology_genetics_summary.pdf' },
      { name: 'ملخص الإنجليزي - القواعد والمفردات.pdf', size: '1.9 MB', type: 'summary', downloadName: 'english_grammar_summary.pdf' },
    ],
  },
];

export function downloadMockFile(fileName: string): void {
  const content = `بسم الله الرحمن الرحيم

محتوى تجريبي للملف: ${fileName}

هذا ملف تجريبي لمنصة الطالب المصري - ثانوية عامة.
يتم إنشاء هذا الملف تلقائياً للتجربة والتوضيح.

تطوير بواسطة المهندس عمر حجازي | Developed by Omar Hegazy

محتوى الدرس:
============
هذا هو المحتوى التعليمي التجريبي. في الإصدار النهائي سيتم استبدال هذا النص
بالمحتوى الفعلي للكتاب أو الملخص.

شكراً لاستخدامكم منصة الطالب المصري.
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
