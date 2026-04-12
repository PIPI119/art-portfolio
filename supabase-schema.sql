-- ================================================================
-- Anastasiia Hrudka Portfolio — ПОВНА МІГРАЦІЯ
-- Безпечно: не видаляє існуючі дані
-- Запустіть у: Supabase Dashboard → SQL Editor → New Query → Run
-- ================================================================

-- ── 1. site_settings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo        JSONB NOT NULL DEFAULT '{}',
  artist      JSONB NOT NULL DEFAULT '{}',
  nav_links   JSONB NOT NULL DEFAULT '[]',
  hero        JSONB NOT NULL DEFAULT '{}',
  biography   JSONB NOT NULL DEFAULT '{}',
  stats       JSONB NOT NULL DEFAULT '[]',
  gallery     JSONB NOT NULL DEFAULT '{}',
  contact     JSONB NOT NULL DEFAULT '{}',
  form_labels JSONB NOT NULL DEFAULT '{}',
  footer      JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS site_settings_singleton
  ON public.site_settings ((true));

-- ── 2. artworks — створити якщо не існує ────────────────────────
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

-- ── 3. Додати ВСІ можливо відсутні колонки (безпечно) ───────────
DO $$
DECLARE
  col RECORD;
  cols TEXT[][] := ARRAY[
    ['title',       'TEXT',        'NOT NULL DEFAULT '''''],
    ['year',        'INTEGER',     'NOT NULL DEFAULT 2024'],
    ['dimensions',  'TEXT',        'NOT NULL DEFAULT '''''],
    ['technique',   'TEXT',        'NOT NULL DEFAULT '''''],
    ['image_url',   'TEXT',        'NOT NULL DEFAULT '''''],
    ['description', 'TEXT',        'NOT NULL DEFAULT '''''],
    ['category',    'TEXT',        'NOT NULL DEFAULT ''Інше'''],
    ['sold',        'BOOLEAN',     'NOT NULL DEFAULT FALSE'],
    ['price',       'INTEGER',     ''],
    ['sort_order',  'INTEGER',     'NOT NULL DEFAULT 0'],
    ['created_at',  'TIMESTAMPTZ', 'NOT NULL DEFAULT NOW()']
  ];
  c TEXT[];
BEGIN
  FOREACH c SLICE 1 IN ARRAY cols LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'artworks'
        AND column_name  = c[1]
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.artworks ADD COLUMN %I %s %s',
        c[1], c[2], c[3]
      );
      RAISE NOTICE 'Added column: %', c[1];
    ELSE
      RAISE NOTICE 'Column % already exists — skipped', c[1];
    END IF;
  END LOOP;
END $$;

-- ── 4. RLS ───────────────────────────────────────────────────────
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_settings"      ON public.site_settings;
DROP POLICY IF EXISTS "Allow all writes site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public read artworks"           ON public.artworks;
DROP POLICY IF EXISTS "Allow all writes artworks"      ON public.artworks;

CREATE POLICY "Public read site_settings"
  ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow all writes site_settings"
  ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read artworks"
  ON public.artworks FOR SELECT USING (true);
CREATE POLICY "Allow all writes artworks"
  ON public.artworks FOR ALL USING (true) WITH CHECK (true);

-- ── 5. Індекси ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS artworks_category_idx   ON public.artworks (category);
CREATE INDEX IF NOT EXISTS artworks_sort_order_idx ON public.artworks (sort_order);
CREATE INDEX IF NOT EXISTS artworks_sold_idx       ON public.artworks (sold);

-- ── 6. Тестові дані ─────────────────────────────────────────────
INSERT INTO public.artworks
  (title, year, dimensions, technique, image_url, description, category, sold, price, sort_order)
VALUES
  ('Ранковий берег', 2023, '60×80 см', 'Олія на полотні',
   'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80',
   'Медитативний пейзаж одеського узбережжя на світанку.',
   'Пейзаж', FALSE, 15000, 1),
  ('Тиша', 2023, '40×50 см', 'Акварель',
   'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80',
   'Абстрактна композиція у приглушених тонах.',
   'Абстракція', TRUE, NULL, 2),
  ('Портрет у сутінках', 2022, '50×70 см', 'Олія на полотні',
   'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80',
   'Психологічний портрет з грою тіні і світла.',
   'Портрет', FALSE, 22000, 3),
  ('Квіти на підвіконні', 2022, '35×45 см', 'Олія на полотні',
   'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80',
   'Камерний натюрморт з польовими квітами.',
   'Натюрморт', FALSE, 9500, 4),
  ('Степовий вітер', 2021, '80×100 см', 'Олія на полотні',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
   'Широкоформатний пейзаж українського степу.',
   'Пейзаж', TRUE, NULL, 5),
  ('Лінії міста', 2023, '50×70 см', 'Туш, папір',
   'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
   'Графічна серія, присвячена архітектурі Одеси.',
   'Графіка', FALSE, 7800, 6)
ON CONFLICT DO NOTHING;

-- ── 7. Перевірка ────────────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'artworks'
ORDER BY ordinal_position;

SELECT COUNT(*) AS artworks_total FROM public.artworks;
