import type { ThemeMode, ColorMode } from './types';

const KEYS = {
  GEMINI_API_KEY: 'gemini_api_key',
  GEMINI_MODEL: 'gemini_model',
  ADMIN_AUTH: 'admin_auth',
  THEME_MODE: 'theme_mode',
  COLOR_MODE: 'color_mode',
  ADSTERRA_ENABLED: 'adsterra_enabled',
  AD_CODES: 'ad_codes',
  SESSION_ID: 'session_id',
  CHAT_HISTORY: 'chat_history',
  SITE_NAME: 'site_name',
  SITE_SUBTITLE: 'site_subtitle',
  FAVICON_URL: 'favicon_url',
} as const;

export type AdSlotKey = 'header' | 'sidebar' | 'inline' | 'footer';
export type AdCodes = Record<AdSlotKey, string>;

export function getApiKey(): string {
  return localStorage.getItem(KEYS.GEMINI_API_KEY) || '';
}

function normalizeApiKey(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/(?:AIza|AQ\.)[A-Za-z0-9._-]+/);
  return match?.[0] || trimmed;
}

export function setApiKey(key: string): void {
  localStorage.setItem(KEYS.GEMINI_API_KEY, normalizeApiKey(key));
}

export function getGeminiModel(): string {
  return localStorage.getItem(KEYS.GEMINI_MODEL) || 'gemini-1.5-flash';
}

export function setGeminiModel(model: string): void {
  localStorage.setItem(KEYS.GEMINI_MODEL, model);
}

export function getSiteName(): string {
  return localStorage.getItem(KEYS.SITE_NAME) || 'منصة الطالب المصري';
}

export function setSiteName(name: string): void {
  localStorage.setItem(KEYS.SITE_NAME, name);
}

export function getSiteSubtitle(): string {
  return localStorage.getItem(KEYS.SITE_SUBTITLE) || 'ثانوية عامة';
}

export function setSiteSubtitle(sub: string): void {
  localStorage.setItem(KEYS.SITE_SUBTITLE, sub);
}

export function getFaviconUrl(): string {
  return localStorage.getItem(KEYS.FAVICON_URL) || '/favicon.svg';
}

export function setFaviconUrl(url: string): void {
  localStorage.setItem(KEYS.FAVICON_URL, url);
}

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(KEYS.ADMIN_AUTH) === 'true';
}

export function setAdminAuthed(val: boolean): void {
  if (val) sessionStorage.setItem(KEYS.ADMIN_AUTH, 'true');
  else sessionStorage.removeItem(KEYS.ADMIN_AUTH);
}

const VALID_THEMES: ThemeMode[] = [
  'normal', 'ramadan', 'eid_fitr', 'eid_adha', 'mawlid',
  'october', 'sinai', 'republic', 'newyear', 'mothersday',
  'teachersday', 'nationalday',
];

export function getThemeMode(): ThemeMode {
  const val = localStorage.getItem(KEYS.THEME_MODE);
  if (val && VALID_THEMES.includes(val as ThemeMode)) return val as ThemeMode;
  return 'normal';
}

export function setThemeMode(mode: ThemeMode): void {
  localStorage.setItem(KEYS.THEME_MODE, mode);
}

export function getColorMode(): ColorMode {
  const val = localStorage.getItem(KEYS.COLOR_MODE);
  return val === 'dark' ? 'dark' : 'light';
}

export function setColorMode(mode: ColorMode): void {
  localStorage.setItem(KEYS.COLOR_MODE, mode);
}

const DEFAULT_AD_CODES: AdCodes = {
  header: `<script>
  atOptions = {
    'key' : '05070433952b2ef2d6e2b977a4e9d58b',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://www.highrevenueformat.com/05070433952b2ef2d6e2b977a4e9d58b/invoke.js"></script>`,
  sidebar: `<script>
  atOptions = {
    'key' : '6a14403dff695811ad8ac88f567f01fc',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://www.highrevenueformat.com/6a14403dff695811ad8ac88f567f01fc/invoke.js"></script>`,
  inline: `<script src="https://pl31737407.profitableratecpmnetwork.com/4d/30/56/4d3056825d3f76ea4d01d3c7f952e448.js"></script>`,
  footer: `<script async="async" data-cfasync="false" src="https://pl31737408.profitableratecpmnetwork.com/63b11d62a816d9a295ca00eace9624d0/invoke.js"></script>
<div id="container-63b11d62a816d9a295ca00eace9624d0"></div>`,
};

export function getAdCodes(): AdCodes {
  const raw = localStorage.getItem(KEYS.AD_CODES);
  if (!raw) {
    return { ...DEFAULT_AD_CODES };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      header: parsed.header ?? DEFAULT_AD_CODES.header,
      sidebar: parsed.sidebar ?? DEFAULT_AD_CODES.sidebar,
      inline: parsed.inline ?? DEFAULT_AD_CODES.inline,
      footer: parsed.footer ?? DEFAULT_AD_CODES.footer,
    };
  } catch {
    return { ...DEFAULT_AD_CODES };
  }
}

export function setAdCodes(codes: AdCodes): void {
  localStorage.setItem(KEYS.AD_CODES, JSON.stringify(codes));
}

export function getAdsterraEnabled(): boolean {
  const v = localStorage.getItem(KEYS.ADSTERRA_ENABLED);
  if (v === null) return true;
  return v === 'true';
}

export function setAdsterraEnabled(val: boolean): void {
  localStorage.setItem(KEYS.ADSTERRA_ENABLED, String(val));
}

export function getSessionId(): string {
  let id = localStorage.getItem(KEYS.SESSION_ID);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEYS.SESSION_ID, id);
  }
  return id;
}

export function getChatHistory(): Array<{ role: 'user' | 'model'; content: string; timestamp: number }> {
  const raw = localStorage.getItem(KEYS.CHAT_HISTORY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setChatHistory(history: Array<{ role: 'user' | 'model'; content: string; timestamp: number }>): void {
  localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(history.slice(-50)));
}

export function clearChatHistory(): void {
  localStorage.removeItem(KEYS.CHAT_HISTORY);
}
