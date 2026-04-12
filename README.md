# Anastasiia Hrudka — Portfolio v2.0

Мінімалістичний сайт-портфоліо з повністю динамічним контентом, мобільною адаптацією та панеллю адміністратора.

## Що нового у v2.0

- **Fluid Typography** — шрифти і відступи адаптуються плавно під будь-який екран (`clamp()`)
- **Framer Motion** — плавні анімації появи (`useInView`, `AnimatePresence`)
- **Image Upload** — drag-and-drop завантаження фото логотипу та портрету художниці
- **Supabase Storage** — всі зображення зберігаються у хмарі (`portfolio-images` bucket)
- **Sonner Toasts** — сповіщення про успіх / помилку в кожній дії адмінки
- **Mobile-first Admin** — бокова панель виїжджає знизу на мобільних, всі кнопки ≥ 44px
- **Конкретні помилки Supabase** — код + повідомлення замість пустого `{}`
- **Паралельне завантаження** — `site_settings` і `artworks` грузяться одночасно

## Стек

| Технологія | Версія | Роль |
|---|---|---|
| Next.js | 14.2 | App Router, SSR |
| TypeScript | 5.5 | Типізація |
| Tailwind CSS | 3.4 | Стилі + Fluid Type |
| Framer Motion | 11 | Анімації |
| Supabase | 2.44 | БД + Storage |
| Sonner | 1.5 | Toasts |
| react-dropzone | 14 | Drag-and-drop upload |
| Lucide React | 0.400 | Іконки |

## Структура

```
src/
├── app/
│   ├── layout.tsx            # Root layout + Toaster
│   ├── page.tsx              # Публічний сайт
│   ├── globals.css           # Fluid type, spacing, CSS variables
│   └── admin/page.tsx        # Адмін-панель (8 розділів)
├── components/
│   ├── Header.tsx            # Анімований мобільний header
│   ├── Footer.tsx
│   ├── admin/
│   │   └── ImageDropzone.tsx # Drag-and-drop upload компонент
│   └── sections/
│       ├── HeroSection.tsx   # Framer Motion стагований reveal
│       ├── AboutSection.tsx  # Портрет + useInView
│       ├── StatsSection.tsx  # Анімовані лічильники
│       ├── GallerySection.tsx# Responsive grid + AnimatePresence
│       └── ContactSection.tsx# Touch-friendly форма
├── lib/
│   ├── supabase.ts           # Клієнт з перевіркою конфігурації
│   ├── storage.ts            # Upload/delete через Supabase Storage
│   ├── settings-context.tsx  # Глобальні налаштування (з re-throw)
│   ├── artworks-context.tsx  # Картини
│   └── defaults.ts           # Fallback контент
└── types/index.ts            # TypeScript інтерфейси
```

## Швидкий старт

```bash
npm install
npm run dev         # http://localhost:3000
# Адмін:           # http://localhost:3000/admin
```

## Налаштування Supabase

1. Створіть проект на [supabase.com](https://supabase.com)
2. **SQL Editor** → виконайте `supabase-schema.sql`
3. **Storage** → створіть bucket `portfolio-images` (Public: ✓)
4. Скопіюйте змінні:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> **Без Supabase** сайт запускається з вбудованими даними. Upload зображень недоступний.

## Адмін-панель — розділи

| Розділ | Що редагується |
|---|---|
| **Загальне** | Текст/зображення логотипу, ім'я, навігація |
| **Hero** | Заголовок, підзаголовок, blurb + preview |
| **Про мене** | Портрет (drag-and-drop), заголовки, всі абзаци |
| **Статистика** | Значення, підписи, іконки 4 лічильників |
| **Галерея** | Назви, список категорій |
| **Картини** | Повний CRUD: зображення, назва, рік, техніка, ціна, статус |
| **Контакти** | Всі дані + мітки форми |
| **Футер** | Копірайт, посилання |

## Деплой (Vercel)

```bash
npm run build  # перевірте що білд проходить
```

Додайте у Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
