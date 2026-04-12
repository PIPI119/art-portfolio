'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Artwork } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── Sample data (used when Supabase is not configured) ───────────────────────
const SAMPLE_ARTWORKS: Artwork[] = [
  { id:'1', title:'Ранковий берег',     year:2023, dimensions:'60×80 см',  technique:'Олія на полотні', image_url:'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80', description:'Медитативний пейзаж одеського узбережжя на світанку.', category:'Пейзаж',    sold:false, price:15000, sort_order:1 },
  { id:'2', title:'Тиша',              year:2023, dimensions:'40×50 см',  technique:'Акварель',        image_url:'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80', description:'Абстрактна композиція у приглушених тонах.',          category:'Абстракція', sold:true,  price:null,  sort_order:2 },
  { id:'3', title:'Портрет у сутінках', year:2022, dimensions:'50×70 см',  technique:'Олія на полотні', image_url:'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80', description:'Психологічний портрет з грою тіні і світла.',         category:'Портрет',   sold:false, price:22000, sort_order:3 },
  { id:'4', title:'Квіти на підвіконні',year:2022, dimensions:'35×45 см',  technique:'Олія на полотні', image_url:'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80', description:'Камерний натюрморт з польовими квітами.',             category:'Натюрморт', sold:false, price:9500,  sort_order:4 },
  { id:'5', title:'Степовий вітер',    year:2021, dimensions:'80×100 см', technique:'Олія на полотні', image_url:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', description:'Широкоформатний пейзаж українського степу.',          category:'Пейзаж',    sold:true,  price:null,  sort_order:5 },
  { id:'6', title:'Лінії міста',       year:2023, dimensions:'50×70 см',  technique:'Туш, папір',      image_url:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80', description:'Графічна серія, присвячена архітектурі Одеси.',       category:'Графіка',   sold:false, price:7800,  sort_order:6 },
];

/**
 * Normalize a raw Supabase row — fills in any missing columns with safe defaults
 * so the UI never crashes if the DB schema is slightly out of sync.
 */
function normalizeArtwork(raw: Record<string, unknown>): Artwork {
  return {
    id:          String(raw.id          ?? ''),
    title:       String(raw.title       ?? ''),
    year:        Number(raw.year        ?? new Date().getFullYear()),
    dimensions:  String(raw.dimensions  ?? ''),
    technique:   String(raw.technique   ?? ''),
    image_url:   String(raw.image_url   ?? ''),
    description: String(raw.description ?? ''),   // ← safe default
    category:    String(raw.category    ?? 'Інше'),
    sold:        Boolean(raw.sold       ?? false),
    price:       raw.price != null ? Number(raw.price) : null,
    sort_order:  Number(raw.sort_order  ?? 0),
    created_at:  raw.created_at ? String(raw.created_at) : undefined,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface ArtworksContextValue {
  artworks:      Artwork[];
  loading:       boolean;
  error:         string | null;
  addArtwork:    (a: Omit<Artwork, 'id' | 'created_at'>) => Promise<void>;
  updateArtwork: (id: string, data: Partial<Artwork>)    => Promise<void>;
  deleteArtwork: (id: string)                            => Promise<void>;
  refetch:       () => Promise<void>;
}

const ArtworksContext = createContext<ArtworksContextValue>({
  artworks:      SAMPLE_ARTWORKS,
  loading:       false,
  error:         null,
  addArtwork:    async () => {},
  updateArtwork: async () => {},
  deleteArtwork: async () => {},
  refetch:       async () => {},
});

export function ArtworksProvider({ children }: { children: React.ReactNode }) {
  const [artworks, setArtworks] = useState<Artwork[]>(SAMPLE_ARTWORKS);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchArtworks = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('[Artworks] Supabase не налаштовано — використовуються приклади.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch ALL rows — Supabase default limit is 1000, use range for big sets
      const { data, error: sbError, count } = await supabase
        .from('artworks')
        .select('*', { count: 'exact' })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
        // Explicit range: up to 500 artworks — adjust if you need more
        .range(0, 499);

      if (sbError) {
        throw new Error(`Supabase [${sbError.code}]: ${sbError.message}`);
      }

      if (data && data.length > 0) {
        // Normalize every row — protects against missing columns
        const normalized = (data as Record<string, unknown>[]).map(normalizeArtwork);
        setArtworks(normalized);
        console.log(`[Artworks] Завантажено ${normalized.length} / ${count ?? '?'} робіт ✓`);
      } else {
        console.log('[Artworks] Таблиця порожня, використовуються приклади.');
        // Don't overwrite sample data if DB is empty — leave demo visible
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Artworks] Помилка завантаження:', msg);
      setError(msg);
      // Keep whatever data we had before (samples or previous fetch)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArtworks(); }, [fetchArtworks]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addArtwork = useCallback(async (artwork: Omit<Artwork, 'id' | 'created_at'>) => {
    if (!isSupabaseConfigured || !supabase) {
      const local = normalizeArtwork({ ...artwork, id: `local_${Date.now()}` });
      setArtworks(prev => [...prev, local]);
      return;
    }
    const { data, error: sbError } = await supabase
      .from('artworks')
      .insert(artwork)
      .select()
      .single();
    if (sbError) throw new Error(`Supabase [${sbError.code}]: ${sbError.message}`);
    if (data) setArtworks(prev => [...prev, normalizeArtwork(data as Record<string, unknown>)]);
  }, []);

  const updateArtwork = useCallback(async (id: string, updates: Partial<Artwork>) => {
    // Optimistic update first — UI responds instantly
    setArtworks(prev => prev.map(a => a.id === id ? normalizeArtwork({ ...a, ...updates }) : a));
    if (!isSupabaseConfigured || !supabase) return;
    const { error: sbError } = await supabase
      .from('artworks')
      .update(updates)
      .eq('id', id);
    if (sbError) {
      // Revert optimistic update on failure
      fetchArtworks();
      throw new Error(`Supabase [${sbError.code}]: ${sbError.message}`);
    }
  }, [fetchArtworks]);

  const deleteArtwork = useCallback(async (id: string) => {
    setArtworks(prev => prev.filter(a => a.id !== id));
    if (!isSupabaseConfigured || !supabase) return;
    const { error: sbError } = await supabase
      .from('artworks')
      .delete()
      .eq('id', id);
    if (sbError) {
      fetchArtworks(); // revert on error
      throw new Error(`Supabase [${sbError.code}]: ${sbError.message}`);
    }
  }, [fetchArtworks]);

  return (
    <ArtworksContext.Provider
      value={{ artworks, loading, error, addArtwork, updateArtwork, deleteArtwork, refetch: fetchArtworks }}
    >
      {children}
    </ArtworksContext.Provider>
  );
}

export const useArtworks = () => useContext(ArtworksContext);
