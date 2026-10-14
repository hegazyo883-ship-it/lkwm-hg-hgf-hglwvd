import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { ThemeMode, ColorMode } from '@/lib/types';
import {
  getThemeMode,
  setThemeMode as storeTheme,
  getColorMode,
  setColorMode as storeColor,
  getAdsterraEnabled,
  setAdsterraEnabled as storeAdsterra,
  getAdCodes,
  setAdCodes as storeAdCodes,
  type AdCodes,
  getSiteName,
  setSiteName as storeSiteName,
  getSiteSubtitle,
  setSiteSubtitle as storeSiteSubtitle,
  getFaviconUrl,
  setFaviconUrl as storeFavicon,
} from '@/lib/storage';

interface AppContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colorMode: ColorMode;
  toggleColorMode: () => void;
  adsterraEnabled: boolean;
  setAdsterraEnabled: (val: boolean) => void;
  adCodes: AdCodes;
  setAdCodes: (codes: AdCodes) => void;
  siteName: string;
  setSiteName: (name: string) => void;
  siteSubtitle: string;
  setSiteSubtitle: (sub: string) => void;
  faviconUrl: string;
  setFaviconUrl: (url: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getThemeMode());
  const [colorMode, setColorModeState] = useState<ColorMode>(() => getColorMode());
  const [adsterraEnabled, setAdsterraState] = useState<boolean>(() => getAdsterraEnabled());
  const [adCodes, setAdCodesState] = useState<AdCodes>(() => getAdCodes());
  const [siteName, setSiteNameState] = useState<string>(() => getSiteName());
  const [siteSubtitle, setSiteSubtitleState] = useState<string>(() => getSiteSubtitle());
  const [faviconUrl, setFaviconUrlState] = useState<string>(() => getFaviconUrl());

  useEffect(() => {
    const root = document.documentElement;
    if (colorMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', themeMode);
  }, [colorMode, themeMode]);

  useEffect(() => {
    document.title = `${siteName} - ${siteSubtitle}`;
  }, [siteName, siteSubtitle]);

  useEffect(() => {
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (link) {
      link.href = faviconUrl;
    }
  }, [faviconUrl]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    storeTheme(mode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      storeColor(next);
      return next;
    });
  }, []);

  const setAdsterraEnabled = useCallback((val: boolean) => {
    setAdsterraState(val);
    storeAdsterra(val);
  }, []);

  const setAdCodes = useCallback((codes: AdCodes) => {
    setAdCodesState(codes);
    storeAdCodes(codes);
  }, []);

  const setSiteName = useCallback((name: string) => {
    setSiteNameState(name);
    storeSiteName(name);
  }, []);

  const setSiteSubtitle = useCallback((sub: string) => {
    setSiteSubtitleState(sub);
    storeSiteSubtitle(sub);
  }, []);

  const setFaviconUrl = useCallback((url: string) => {
    setFaviconUrlState(url);
    storeFavicon(url);
  }, []);

  return (
    <AppContext.Provider
      value={{
        themeMode, setThemeMode, colorMode, toggleColorMode,
        adsterraEnabled, setAdsterraEnabled,
        adCodes, setAdCodes,
        siteName, setSiteName, siteSubtitle, setSiteSubtitle,
        faviconUrl, setFaviconUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
