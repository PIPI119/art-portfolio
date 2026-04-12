'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SiteSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/defaults';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface SettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (updated: Partial<SiteSettings>) => Promise<void>;
  refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loading: false,
  error: null,
  updateSettings: async () => {},
  refetch: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('[Settings] Supabase не налаштовано — використовуються дефолтні дані.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error: sbError } = await supabase
        .from('site_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (sbError) {
        if (sbError.code === 'PGRST116') {
          console.log('[Settings] Рядок налаштувань не знайдено, використовуються дефолтні дані.');
        } else {
          throw new Error(`Supabase [${sbError.code}]: ${sbError.message}${sbError.details ? ' — ' + sbError.details : ''}`);
        }
      } else if (data) {
        const merged: SiteSettings = {
          ...DEFAULT_SETTINGS,
          ...data,
          logo:       { ...DEFAULT_SETTINGS.logo,       ...(data.logo       ?? {}) },
          artist:     { ...DEFAULT_SETTINGS.artist,     ...(data.artist     ?? {}) },
          hero:       { ...DEFAULT_SETTINGS.hero,       ...(data.hero       ?? {}) },
          biography:  { ...DEFAULT_SETTINGS.biography,  ...(data.biography  ?? {}) },
          gallery:    { ...DEFAULT_SETTINGS.gallery,    ...(data.gallery    ?? {}) },
          contact:    { ...DEFAULT_SETTINGS.contact,    ...(data.contact    ?? {}) },
          form_labels:{ ...DEFAULT_SETTINGS.form_labels,...(data.form_labels ?? {}) },
          footer:     { ...DEFAULT_SETTINGS.footer,     ...(data.footer     ?? {}) },
          nav_links:  data.nav_links ?? DEFAULT_SETTINGS.nav_links,
          stats:      data.stats     ?? DEFAULT_SETTINGS.stats,
        };
        setSettings(merged);
        console.log('[Settings] Завантажено з Supabase ✓');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Settings] Помилка завантаження:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSettings = useCallback(async (updated: Partial<SiteSettings>) => {
    const merged = { ...settings, ...updated };
    setSettings(merged);
    if (!isSupabaseConfigured || !supabase) {
      console.log('[Settings] Supabase не налаштовано — зміни лише локальні.');
      return;
    }
    try {
      const payload = { ...merged, updated_at: new Date().toISOString() };
      if (settings.id) {
        const { error: sbError } = await supabase
          .from('site_settings').update(payload).eq('id', settings.id);
        if (sbError) throw new Error(`Supabase [${sbError.code}]: ${sbError.message}`);
      } else {
        const { data, error: sbError } = await supabase
          .from('site_settings').insert(payload).select().single();
        if (sbError) throw new Error(`Supabase [${sbError.code}]: ${sbError.message}`);
        if (data?.id) setSettings(prev => ({ ...prev, id: data.id }));
      }
      console.log('[Settings] Збережено у Supabase ✓');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Settings] Помилка збереження:', msg);
      setError(msg);
      throw err; // re-throw so admin panel can show toast
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, updateSettings, refetch: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
