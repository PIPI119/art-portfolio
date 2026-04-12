# 🚀 Налаштування за 5 хвилин

## ❗ Якщо таблиця artworks вже існує (помилка "column description does not exist")

Запустіть `supabase-schema.sql` ще раз — скрипт тепер безпечно додає відсутні
колонки через `DO $$ BEGIN ... END $$` без видалення даних.

---

## Крок 1 — SQL (таблиці + міграція)

1. [Supabase Dashboard](https://supabase.com/dashboard/project/vpvcercocvkhellmmhqe)
2. **SQL Editor → New Query**
3. Скопіюйте весь `supabase-schema.sql` → **Run**
4. Результат внизу: `artworks total: 6` (або більше якщо дані вже були) ✓

---

## Крок 2 — Storage bucket (для завантаження фото)

1. **Storage → New bucket**
   - Name: `portfolio-images`
   - ✅ Public bucket → **Save**

2. **Storage → portfolio-images → Policies → New policy → For full customization**:
   ```
   Policy name:          Allow all
   Allowed operations:   ✅ SELECT  ✅ INSERT  ✅ UPDATE  ✅ DELETE
   Target roles:         (порожньо — всі)
   USING expression:     true
   WITH CHECK:           true
   ```
   → **Save policy**

---

## Крок 3 — Запуск локально

```bash
npm install
npm run dev
# Сайт:  http://localhost:3000
# Адмін: http://localhost:3000/admin
```

`.env.local` вже містить ваші ключі — нічого додавати не потрібно.

---

## Крок 4 — Деплой на Vercel

1. GitHub → новий репозиторій → `git push`
2. [vercel.com](https://vercel.com) → Import → виберіть репо
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL  = https://vpvcercocvkhellmmhqe.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-key-here
   ```
4. **Deploy** ✓

---

## Що оптимізовано для 40+ картин

| Проблема | Рішення |
|---|---|
| Всі картини анімуються з delay | Кожна картка має власний `useInView` — анімує тільки коли входить у viewport |
| Layout shift при завантаженні | `width/height` hints на `<img>`, `containIntrinsicSize` на картках |
| Зайві ре-рендери | `ArtworkCard` обгорнута у `memo()` |
| Довгий стагер на 40 карток | Видалено `delay: i * 0.04` — замінено на Intersection Observer |
| Supabase повертає 1000 рядків max | Явний `.range(0, 499)` — підтримує до 500 картин |
| Зайві ре-рендери при фільтрі | `useCallback` на click-handler, `AnimatePresence mode="wait"` |
| Відсутня колонка description | `normalizeArtwork()` підставляє дефолт `''` якщо колонки немає |
| Upload блокує UI | Прогрес-бар + оптимістичне оновлення списку |
