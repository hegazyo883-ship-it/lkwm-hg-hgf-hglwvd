import { useEffect, useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  Palette,
  Newspaper,
  ClipboardList,
  Moon,
  Sun,
  Star,
  Sparkles,
  Cpu,
  Globe,
  Image,
  Upload,
  PartyPopper,
  Heart,
  BookMarked,
  Flag,
  Mountain,
  Sparkle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import {
  isAdminAuthed,
  setAdminAuthed,
  getApiKey,
  setApiKey,
  getGeminiModel,
  setGeminiModel,
  type AdCodes,
} from '@/lib/storage';
import type { Quiz, Post, ThemeMode } from '@/lib/types';

const ADMIN_PASSWORD = '292009zZ@#';

type AdminTab = 'quizzes' | 'posts' | 'settings';

export function AdminPanel() {
  const [authed, setAuthed] = useState(() => isAdminAuthed());
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<AdminTab>('settings');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setAdminAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!authed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white text-center mb-1">
              لوحة الإدارة
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
              أدخل كلمة المرور للوصول إلى لوحة التحكم
            </p>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="كلمة المرور"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-center"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 text-center">كلمة المرور غير صحيحة</p>
              )}
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium text-sm transition-all"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">لوحة الإدارة</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {([
          { id: 'settings' as const, label: 'الإعدادات', icon: Palette },
          { id: 'quizzes' as const, label: 'الامتحانات', icon: ClipboardList },
          { id: 'posts' as const, label: 'المنشورات', icon: Newspaper },
        ]).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'settings' && <SettingsTab />}
      {tab === 'quizzes' && <QuizzesTab />}
      {tab === 'posts' && <PostsTab />}
    </div>
  );
}

// ============ Settings Tab ============
function SettingsTab() {
  const { themeMode, setThemeMode, colorMode, toggleColorMode, adsterraEnabled, setAdsterraEnabled, adCodes, setAdCodes, siteName, setSiteName, siteSubtitle, setSiteSubtitle, faviconUrl, setFaviconUrl } = useApp();
  const [apiKeyInput, setApiKeyInput] = useState(() => getApiKey());
  const [keySaved, setKeySaved] = useState(false);
  const [modelInput, setModelInput] = useState(() => getGeminiModel());
  const [modelSaved, setModelSaved] = useState(false);
  const [siteNameInput, setSiteNameInput] = useState(siteName);
  const [siteSubtitleInput, setSiteSubtitleInput] = useState(siteSubtitle);
  const [faviconInput, setFaviconInput] = useState(faviconUrl);
  const [siteSaved, setSiteSaved] = useState(false);
  const [adCodeDraft, setAdCodeDraft] = useState<AdCodes>(adCodes);
  const [adSaved, setAdSaved] = useState(false);

  const saveApiKey = () => {
    setApiKey(apiKeyInput);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const saveModel = () => {
    setGeminiModel(modelInput.trim() || 'gemini-1.5-flash');
    setModelSaved(true);
    setTimeout(() => setModelSaved(false), 2000);
  };

  const saveSiteSettings = () => {
    setSiteName(siteNameInput.trim() || 'منصة الطالب المصري');
    setSiteSubtitle(siteSubtitleInput.trim() || 'ثانوية عامة');
    setFaviconUrl(faviconInput.trim() || '/favicon.svg');
    setSiteSaved(true);
    setTimeout(() => setSiteSaved(false), 2000);
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024) {
      alert('حجم الصورة كبير جداً. الحد الأقصى 100 كيلوبايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFaviconInput(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const saveAdCodes = () => {
    setAdCodes(adCodeDraft);
    setAdSaved(true);
    setTimeout(() => setAdSaved(false), 2000);
  };

  const themes: { id: ThemeMode; label: string; icon: typeof Palette; desc: string }[] = [
    { id: 'normal', label: 'الوضع الطبيعي', icon: Palette, desc: 'التصميم الافتراضي' },
    { id: 'ramadan', label: 'زينة شهر رمضان', icon: Moon, desc: 'فوانيس متحركة وهلال' },
    { id: 'eid_fitr', label: 'عيد الفطر', icon: Sparkle, desc: 'أهلة ونجوم متلألئة' },
    { id: 'eid_adha', label: 'عيد الأضحى', icon: Star, desc: 'الكعبة ونجوم ذهبية' },
    { id: 'mawlid', label: 'المولد النبوي', icon: Sparkles, desc: 'زخارف خضراء وأنوار' },
    { id: 'october', label: 'نصر أكتوبر', icon: Flag, desc: 'أعلام مصر متحركة' },
    { id: 'sinai', label: 'تحرير سيناء', icon: Mountain, desc: 'أعلام وصحراء - 25 أبريل' },
    { id: 'republic', label: 'إعلان الجمهورية', icon: Star, desc: 'أعلام ونجوم - 23 يوليو' },
    { id: 'newyear', label: 'رأس السنة', icon: PartyPopper, desc: 'ألعاب نارية ونجوم' },
    { id: 'mothersday', label: 'عيد الأم', icon: Heart, desc: 'ورود وزهور - 21 مارس' },
    { id: 'teachersday', label: 'عيد المعلم', icon: BookMarked, desc: 'كتب وتفاحات - 13 مايو' },
    { id: 'nationalday', label: 'عيد الشرطة', icon: Shield, desc: 'أعلام ودرع - 25 يناير' },
  ];

  return (
    <div className="space-y-5">
      {/* Gemini API Key */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Key className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">مفتاح Gemini API</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">الصق المفتاح حتى لو كان معه عنوان أو مسافات؛ سيتم تنظيفه تلقائياً</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIza..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={saveApiKey}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium text-sm transition-all"
          >
            <Save className="w-4 h-4" />
            {keySaved ? 'تم الحفظ!' : 'حفظ'}
          </button>
        </div>
      </div>

      {/* Gemini Model Version */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">إصدار Gemini</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">اختر إصدار نموذج الذكاء الاصطناعي</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="gemini-1.5-flash">Gemini 1.5 Flash (سريع - موصى به)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (أقوى - أبطأ)</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash (الأحدث)</option>
            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Experimental</option>
            <option value="gemini-pro">Gemini Pro (القديم)</option>
          </select>
          <button
            onClick={saveModel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm transition-all shrink-0"
          >
            <Save className="w-4 h-4" />
            {modelSaved ? 'تم!' : 'حفظ'}
          </button>
        </div>
      </div>

      {/* Site Identity */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
            <Globe className="w-4 h-4 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">هوية الموقع</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">اسم الموقع والعنوان الفرعي</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">اسم الموقع</label>
            <input
              type="text"
              value={siteNameInput}
              onChange={(e) => setSiteNameInput(e.target.value)}
              placeholder="منصة الطالب المصري"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">العنوان الفرعي</label>
            <input
              type="text"
              value={siteSubtitleInput}
              onChange={(e) => setSiteSubtitleInput(e.target.value)}
              placeholder="ثانوية عامة"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">أيقونة الموقع (Favicon)</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                {faviconInput && (faviconInput.startsWith('data:') || faviconInput.startsWith('http')) ? (
                  <img src={faviconInput} alt="favicon" className="w-full h-full object-contain" />
                ) : (
                  <Image className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <input
                type="text"
                value={faviconInput.startsWith('data:') ? '(صورة مرفوعة)' : faviconInput}
                onChange={(e) => setFaviconInput(e.target.value)}
                placeholder="/favicon.svg أو رابط صورة"
                disabled={faviconInput.startsWith('data:')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
              />
              <label className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium cursor-pointer transition-all shrink-0">
                <Upload className="w-4 h-4" />
                رفع
                <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
              </label>
              {faviconInput.startsWith('data:') && (
                <button
                  onClick={() => setFaviconInput('/favicon.svg')}
                  className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all shrink-0"
                  title="إزالة الصورة"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              يمكنك رفع صورة من جهازك (حتى 100 ك.ب) أو إدخال رابط مباشر
            </p>
          </div>

          <button
            onClick={saveSiteSettings}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-sm transition-all"
          >
            <Save className="w-4 h-4" />
            {siteSaved ? 'تم حفظ الإعدادات!' : 'حفظ هوية الموقع'}
          </button>
        </div>
      </div>

      {/* Ad Management with JavaScript Code Injection */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">إعلانات JavaScript</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">تفعيل الإعلانات ولصق أكواد JavaScript لكل موضع</p>
            </div>
          </div>
          <button
            onClick={() => setAdsterraEnabled(!adsterraEnabled)}
            className="flex items-center gap-2 transition-all"
          >
            {adsterraEnabled ? (
              <ToggleRight className="w-12 h-12 text-emerald-500" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            )}
          </button>
        </div>

        {adsterraEnabled && (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-700">
            {([
              { key: 'header' as const, label: 'إعلان أعلى الصفحة', hint: 'يظهر في رأس الصفحة' },
              { key: 'sidebar' as const, label: 'إعلان الشريط الجانبي', hint: 'يظهر في العمود الجانبي' },
              { key: 'inline' as const, label: 'إعلان داخل المحتوى', hint: 'يظهر بين الفقرات' },
              { key: 'footer' as const, label: 'إعلان أسفل الصفحة', hint: 'يظهر في التذييل' },
            ]).map((slot) => (
              <div key={slot.key}>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {slot.label}
                  <span className="mr-1 text-slate-400">— {slot.hint}</span>
                </label>
                <textarea
                  value={adCodeDraft[slot.key]}
                  onChange={(e) => setAdCodeDraft({ ...adCodeDraft, [slot.key]: e.target.value })}
                  placeholder="الصق كود JavaScript هنا (<script src=...> أو كود مضمّن)"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </div>
            ))}
            <button
              onClick={saveAdCodes}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-amber-600"
            >
              <Save className="h-4 w-4" />
              {adSaved ? 'تم حفظ أكواد الإعلانات!' : 'حفظ أكواد الإعلانات'}
            </button>
          </div>
        )}

        {/* Ad placement matrix */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-3">مصفوفة مواضع الإعلانات:</p>
          <div className="grid grid-cols-2 gap-2">
            {['لوحة التحكم', 'حاسبة المجموع', 'مركز الامتحانات', 'الملخصات والكتب', 'ساحة المنشورات'].map((loc) => (
              <div
                key={loc}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                  adsterraEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-700/30 text-slate-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${adsterraEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                {loc}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Theme selector */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Palette className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">مظهر المنصة</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">اختر ثيم العرض</p>
          </div>
        </div>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {themes.map((t) => {
            const Icon = t.icon;
            const active = themeMode === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setThemeMode(t.id)}
                className={`p-4 rounded-xl border-2 text-right transition-all ${
                  active
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${active ? 'text-blue-500' : 'text-slate-400'}`} />
                <p className={`text-sm font-medium ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {t.label}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color mode */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              {colorMode === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">الوضع الليلي/النهاري</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {colorMode === 'dark' ? 'الوضع الليلي مفعّل' : 'الوضع النهاري مفعّل'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleColorMode}
            className="flex items-center gap-2 transition-all"
          >
            {colorMode === 'dark' ? (
              <ToggleRight className="w-12 h-12 text-indigo-400" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-slate-300" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Quizzes Tab ============
function QuizzesTab() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
    if (data) setQuizzes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الامتحان؟')) return;
    await supabase.from('quizzes').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => { setEditing(null); setShowForm(true); }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all"
      >
        <Plus className="w-4 h-4" />
        إضافة امتحان جديد
      </button>

      {showForm && (
        <QuizForm
          quiz={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { load(); setShowForm(false); setEditing(null); }}
        />
      )}

      {loading ? (
        <div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
            >
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{quiz.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {quiz.subject} - {quiz.duration_minutes} دقيقة
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(quiz); setShowForm(true); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(quiz.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizForm({ quiz, onClose, onSaved }: { quiz: Quiz | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(quiz?.title || '');
  const [subject, setSubject] = useState(quiz?.subject || '');
  const [duration, setDuration] = useState(quiz?.duration_minutes?.toString() || '10');
  const [description, setDescription] = useState(quiz?.description || '');
  const [questions, setQuestions] = useState<Array<{ question: string; options: string[]; correct_index: number }>>([]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct_index: 0 }]);
  };

  const updateQuestion = (idx: number, field: string, value: string | number) => {
    const updated = [...questions];
    if (field === 'question') updated[idx].question = value as string;
    else if (field === 'correct_index') updated[idx].correct_index = value as number;
    else {
      const optIdx = parseInt(field.split('_')[1]);
      updated[idx].options[optIdx] = value as string;
    }
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!title.trim() || !subject.trim()) return;

    if (quiz) {
      await supabase.from('quizzes').update({
        title, subject, duration_minutes: parseInt(duration) || 10, description,
      }).eq('id', quiz.id);

      if (questions.length > 0) {
        await supabase.from('quiz_questions').delete().eq('quiz_id', quiz.id);
        await supabase.from('quiz_questions').insert(
          questions.filter(q => q.question.trim()).map(q => ({
            quiz_id: quiz.id,
            question: q.question,
            options: q.options,
            correct_index: q.correct_index,
          }))
        );
      }
    } else {
      const { data: newQuiz } = await supabase.from('quizzes').insert({
        title, subject, duration_minutes: parseInt(duration) || 10, description,
      }).select().single();

      if (newQuiz && questions.length > 0) {
        await supabase.from('quiz_questions').insert(
          questions.filter(q => q.question.trim()).map(q => ({
            quiz_id: newQuiz.id,
            question: q.question,
            options: q.options,
            correct_index: q.correct_index,
          }))
        );
      }
    }

    onSaved();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          {quiz ? 'تعديل امتحان' : 'امتحان جديد'}
        </h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الامتحان"
          className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="المادة"
          className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="المدة (دقائق)"
          className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف الامتحان"
          className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">الأسئلة</p>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            سؤال
          </button>
        </div>

        {questions.map((q, qIdx) => (
          <div key={qIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                {qIdx + 1}
              </span>
              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                placeholder="نص السؤال"
                className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => removeQuestion(qIdx)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuestion(qIdx, 'correct_index', optIdx)}
                    className={`w-5 h-5 rounded-full shrink-0 border-2 transition-all ${
                      q.correct_index === optIdx
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {q.correct_index === optIdx && <div className="w-2 h-2 mx-auto rounded-full bg-white mt-0.5" />}
                  </button>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateQuestion(qIdx, `opt_${optIdx}`, e.target.value)}
                    placeholder={`خيار ${optIdx + 1}`}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all"
      >
        <Save className="w-4 h-4" />
        حفظ
      </button>
    </div>
  );
}

// ============ Posts Tab ============
function PostsTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    await supabase.from('posts').delete().eq('id', id);
    load();
  };

  const togglePin = async (post: Post) => {
    await supabase.from('posts').update({ pinned: !post.pinned }).eq('id', post.id);
    load();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => { setEditing(null); setShowForm(true); }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all"
      >
        <Plus className="w-4 h-4" />
        إضافة منشور جديد
      </button>

      {showForm && (
        <PostForm
          post={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { load(); setShowForm(false); setEditing(null); }}
        />
      )}

      {loading ? (
        <div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{post.title}</p>
                  {post.pinned && <span className="text-xs text-amber-500">مثبت</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {post.likes_count} إعجاب
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => togglePin(post)}
                  className={`p-2 rounded-lg transition-all ${
                    post.pinned
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                  }`}
                  title="تثبيت/إلغاء تثبيت"
                >
                  <Star className={`w-4 h-4 ${post.pinned ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => { setEditing(post); setShowForm(true); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PostForm({ post, onClose, onSaved }: { post: Post | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(post?.title || '');
  const [body, setBody] = useState(post?.body || '');
  const [badge, setBadge] = useState(post?.author_badge || 'الإدارة');

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) return;

    if (post) {
      await supabase.from('posts').update({
        title, body, author_badge: badge,
      }).eq('id', post.id);
    } else {
      await supabase.from('posts').insert({
        title, body, author_badge: badge,
      });
    }
    onSaved();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          {post ? 'تعديل منشور' : 'منشور جديد'}
        </h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="عنوان المنشور"
        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={badge}
        onChange={(e) => setBadge(e.target.value)}
        placeholder="شارة الكاتب (الإدارة)"
        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="نص المنشور..."
        rows={5}
        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all"
      >
        <Save className="w-4 h-4" />
        حفظ
      </button>
    </div>
  );
}
