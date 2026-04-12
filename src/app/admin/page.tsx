'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSettings } from '@/lib/settings-context';
import { useArtworks } from '@/lib/artworks-context';
import {
  ArrowLeft, Eye, Save, Plus, Trash2,
  Settings, Image, Type, BarChart3 as BarChartIcon, Phone, Layout,
  ChevronDown, ChevronUp, GripVertical, Check, AlertCircle
} from 'lucide-react';
import { SiteSettings, Artwork, StatIcon } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/defaults';
import ImageDropzone from '@/components/admin/ImageDropzone';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'general' | 'hero' | 'about' | 'stats' | 'gallery-settings' | 'artworks' | 'contact' | 'footer';

// Найди этот блок:
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'general',          label: 'Загальне',        icon: Settings      },
  { id: 'hero',             label: 'Hero',             icon: Layout        },
  { id: 'about',            label: 'Про мене',         icon: Type          },
  { id: 'stats',            label: 'Статистика',       icon: BarChartIcon  },
  { id: 'artworks',         label: 'Роботи',           icon: Palette       },
  { id: 'contact_settings', label: 'Контакти',         icon: Contact       },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { settings, updateSettings, loading: settingsLoading, error: settingsError } = useSettings();
  const { artworks, addArtwork, updateArtwork, deleteArtwork } = useArtworks();

  const [activeTab, setActiveTab]   = useState<Tab>('general');
  const [saving, setSaving]         = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Draft mirrors the live settings — edits accumulate here then saved at once
  const [draft, setDraft] = useState<SiteSettings>(() =>
    JSON.parse(JSON.stringify(settings))
  );

  const set = useCallback((path: string, value: unknown) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as Record<string, unknown>;
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (typeof cur[keys[i]] !== 'object' || cur[keys[i]] === null) cur[keys[i]] = {};
        cur = cur[keys[i]] as Record<string, unknown>;
      }
      cur[keys[keys.length - 1]] = value;
      return next as SiteSettings;
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const id = toast.loading('Збереження...');
    try {
      await updateSettings(draft);
      toast.success('Збережено ✓', { id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Помилка: ${msg}`, { id });
    } finally {
      setSaving(false);
    }
  };

  // ── Artwork management state ──
  const [newMode, setNewMode]           = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const emptyArtwork = (): Omit<Artwork,'id'|'created_at'> => ({
    title: '', year: new Date().getFullYear(), dimensions: '',
    technique: '', image_url: '', description: '',
    category: draft.gallery.categories.find(c => c !== 'Всі') ?? 'Пейзаж',
    sold: false, price: null, sort_order: artworks.length + 1,
  });
  const [artworkForm, setArtworkForm] = useState(emptyArtwork);

  return (
    <div className="min-h-screen bg-[#f9f9f7] flex flex-col">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-0 flex items-center justify-between h-14 sticky top-0 z-40 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile sidebar toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-black -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Меню"
          >
            <Settings size={16} />
          </button>
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-xs uppercase tracking-wider flex-shrink-0">
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">На сайт</span>
          </Link>
          <div className="h-4 w-px bg-gray-200 hidden sm:block" />
          <span className="font-serif text-base font-light truncate hidden sm:block">Панель адміністратора</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {settingsError && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-red-500 bg-red-50 px-3 py-1.5 border border-red-100 max-w-xs truncate">
              <AlertCircle size={12} />
              <span className="truncate">{settingsError}</span>
            </div>
          )}
          <a href="/" target="_blank"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors min-h-[40px] px-2">
            <Eye size={13} />
            <span className="hidden sm:inline">Перегляд</span>
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`admin-btn text-xs flex items-center gap-1.5 ${saving ? 'opacity-60' : ''}`}
          >
            {saving ? <span className="spinner" /> : <Save size={13} />}
            <span>Зберегти</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed md:sticky top-14 h-[calc(100vh-3.5rem)] w-56 bg-white border-r border-gray-100
          flex flex-col py-4 z-30 overflow-y-auto transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`
                flex items-center gap-3 px-5 py-3.5 text-xs uppercase tracking-wider font-light text-left
                transition-colors min-h-[48px] w-full
                ${activeTab === id
                  ? 'bg-gray-50 text-black border-r-2 border-black'
                  : 'text-gray-400 hover:text-black hover:bg-gray-50/60'}
              `}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0">
          {settingsLoading ? (
            <div className="flex items-center justify-center h-40 gap-3">
              <span className="spinner" />
              <span className="text-gray-400 font-light text-sm">Завантаження...</span>
            </div>
          ) : (
            <>
              {/* ═══ GENERAL ═══════════════════════════════════════════════ */}
              {activeTab === 'general' && (
                <Section title="Загальні налаштування">
                  <Card title="Логотип">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Текст логотипу">
                        <input className="admin-input" value={draft.logo.text}
                          onChange={e => set('logo.text', e.target.value)} />
                      </Field>
                      <Field label="Розмір шрифту (напр. 1rem, 15px)">
                        <input className="admin-input" value={draft.logo.font_size}
                          onChange={e => set('logo.font_size', e.target.value)} />
                      </Field>
                    </div>
                    <ImageDropzone
                      label="Зображення логотипу (замість тексту)"
                      currentUrl={draft.logo.image_url}
                      folder="logos"
                      onUploaded={url => set('logo.image_url', url)}
                    />
                    {draft.logo.image_url && (
                      <p className="text-xs text-gray-400 font-light">
                        Якщо завантажено зображення — воно відображається замість тексту.
                      </p>
                    )}
                  </Card>

                  <Card title="Художниця">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Ім'я">
                        <input className="admin-input" value={draft.artist.first_name}
                          onChange={e => set('artist.first_name', e.target.value)} />
                      </Field>
                      <Field label="Прізвище">
                        <input className="admin-input" value={draft.artist.last_name}
                          onChange={e => set('artist.last_name', e.target.value)} />
                      </Field>
                    </div>
                  </Card>

                  <Card title="Навігація">
                    <div className="space-y-2">
                      {draft.nav_links.map((link, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <GripVertical size={14} className="text-gray-300 flex-shrink-0 cursor-grab" />
                          <input className="admin-input flex-1" placeholder="Назва" value={link.label}
                            onChange={e => {
                              const updated = [...draft.nav_links];
                              updated[i] = { ...updated[i], label: e.target.value };
                              set('nav_links', updated);
                            }} />
                          <input className="admin-input w-32 flex-shrink-0" placeholder="#href" value={link.href}
                            onChange={e => {
                              const updated = [...draft.nav_links];
                              updated[i] = { ...updated[i], href: e.target.value };
                              set('nav_links', updated);
                            }} />
                          <button onClick={() => set('nav_links', draft.nav_links.filter((_, j) => j !== i))}
                            className="text-gray-300 hover:text-red-400 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => set('nav_links', [...draft.nav_links, { label: 'Новий розділ', href: '#' }])}
                      className="admin-btn-sm mt-2">
                      <Plus size={12} /> Додати посилання
                    </button>
                  </Card>
                </Section>
              )}

              {/* ═══ HERO ═══════════════════════════════════════════════════ */}
              {activeTab === 'hero' && (
                <Section title="Секція Hero">
                  <Card title="Тексти">
                    <Field label="Заголовок (нові рядки через Enter)">
                      <textarea className="admin-input resize-none" rows={3} value={draft.hero.heading}
                        onChange={e => set('hero.heading', e.target.value)} />
                    </Field>
                    <Field label="Підзаголовок (курсив під заголовком)">
                      <input className="admin-input" value={draft.hero.subheading}
                        onChange={e => set('hero.subheading', e.target.value)} />
                    </Field>
                    <Field label="Короткий опис (blurb)">
                      <textarea className="admin-input resize-none" rows={3} value={draft.hero.blurb}
                        onChange={e => set('hero.blurb', e.target.value)} />
                    </Field>
                  </Card>

                  <Card title="Попередній перегляд" hint="Зберегти та відкрити сайт для перегляду">
                    <div className="bg-white border border-gray-100 p-8 font-serif">
                      <p className="text-xs tracking-widest uppercase text-gray-400 font-sans font-light mb-3">
                        {draft.artist.first_name} {draft.artist.last_name}
                      </p>
                      <div className="text-4xl font-light leading-none mb-4 whitespace-pre-line">
                        {draft.hero.heading}
                      </div>
                      <p className="italic text-gray-400 text-lg font-light mb-3">{draft.hero.subheading}</p>
                      <p className="text-gray-400 font-sans font-light text-sm leading-relaxed">{draft.hero.blurb}</p>
                    </div>
                  </Card>
                </Section>
              )}

              {/* ═══ ABOUT ══════════════════════════════════════════════════ */}
              {activeTab === 'about' && (
                <Section title="Секція «Про мене»">
                  <Card title="Заголовки">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Бічний підпис (section label)">
                        <input className="admin-input" value={draft.biography.section_title}
                          onChange={e => set('biography.section_title', e.target.value)} />
                      </Field>
                      <Field label="Головний заголовок">
                        <input className="admin-input" value={draft.biography.heading}
                          onChange={e => set('biography.heading', e.target.value)} />
                      </Field>
                    </div>
                  </Card>

                  <Card title="Портрет художниці">
                    <ImageDropzone
                      label="Фотографія художниці"
                      currentUrl={draft.biography.portrait_url}
                      folder="portraits"
                      onUploaded={url => set('biography.portrait_url', url)}
                      aspectRatio="3 / 4"
                    />
                  </Card>

                  <Card title="Абзаци біографії">
                    <div className="space-y-3">
                      {draft.biography.paragraphs.map((para, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <span className="text-xs text-gray-300 mt-3 flex-shrink-0 w-5 text-right font-light">{i + 1}</span>
                          <textarea
                            className="admin-input flex-1 resize-none"
                            rows={3}
                            value={para}
                            onChange={e => {
                              const updated = [...draft.biography.paragraphs];
                              updated[i] = e.target.value;
                              set('biography.paragraphs', updated);
                            }}
                          />
                          <button
                            onClick={() => set('biography.paragraphs', draft.biography.paragraphs.filter((_, j) => j !== i))}
                            className="text-gray-300 hover:text-red-400 transition-colors p-1 mt-2 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => set('biography.paragraphs', [...draft.biography.paragraphs, ''])}
                      className="admin-btn-sm mt-2">
                      <Plus size={12} /> Додати абзац
                    </button>
                  </Card>
                </Section>
              )}

              {/* ═══ STATS ══════════════════════════════════════════════════ */}
              {activeTab === 'stats' && (
                <Section title="Статистичні лічильники">
                  <p className="text-xs text-gray-400 font-light -mt-2 mb-2">
                    Відображаються на сірій смузі між секцією «Про мене» і галереєю.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {draft.stats.map((stat, i) => (
                      <Card key={i} title={`Лічильник ${i + 1}`}>
                        <Field label="Число або текст (напр. «38» або «150+»)">
                          <input className="admin-input" value={stat.value}
                            onChange={e => {
                              const updated = [...draft.stats];
                              updated[i] = { ...updated[i], value: e.target.value };
                              set('stats', updated);
                            }} />
                        </Field>
                        <Field label="Підпис">
                          <input className="admin-input" value={stat.label}
                            onChange={e => {
                              const updated = [...draft.stats];
                              updated[i] = { ...updated[i], label: e.target.value };
                              set('stats', updated);
                            }} />
                        </Field>
                        <Field label="Іконка">
                          <select className="admin-input" value={stat.icon}
                            onChange={e => {
                              const updated = [...draft.stats];
                              updated[i] = { ...updated[i], icon: e.target.value as StatIcon };
                              set('stats', updated);
                            }}>
                            <option value="package">📦  Package (коробка)</option>
                            <option value="bar-chart">📊  BarChart (графік)</option>
                            <option value="award">🏆  Award (нагорода)</option>
                            <option value="users">👥  Users (клієнти)</option>
                          </select>
                        </Field>
                        {/* Mini preview */}
                        <div className="bg-gray-50 border border-gray-100 p-4 flex flex-col items-center gap-1.5 mt-1">
                          <span className="font-serif text-3xl font-light">{stat.value}</span>
                          <span className="text-xs tracking-widest uppercase text-gray-400 font-light">{stat.label}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Section>
              )}

              {/* ═══ GALLERY SETTINGS ══════════════════════════════════════ */}
              {activeTab === 'gallery-settings' && (
                <Section title="Налаштування галереї">
                  <Card title="Заголовки">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Бічний підпис">
                        <input className="admin-input" value={draft.gallery.section_title}
                          onChange={e => set('gallery.section_title', e.target.value)} />
                      </Field>
                      <Field label="Заголовок">
                        <input className="admin-input" value={draft.gallery.heading}
                          onChange={e => set('gallery.heading', e.target.value)} />
                      </Field>
                      <Field label="Підзаголовок">
                        <input className="admin-input" value={draft.gallery.subheading}
                          onChange={e => set('gallery.subheading', e.target.value)} />
                      </Field>
                    </div>
                  </Card>

                  <Card title="Категорії" hint="Перша категорія — «Всі» (не видаляйте)">
                    <div className="space-y-2">
                      {draft.gallery.categories.map((cat, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-xs text-gray-300 w-5 text-right flex-shrink-0 font-light">{i + 1}</span>
                          <input className="admin-input flex-1" value={cat}
                            onChange={e => {
                              const updated = [...draft.gallery.categories];
                              updated[i] = e.target.value;
                              set('gallery.categories', updated);
                            }} />
                          {i > 0 && (
                            <button
                              onClick={() => set('gallery.categories', draft.gallery.categories.filter((_, j) => j !== i))}
                              className="text-gray-300 hover:text-red-400 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => set('gallery.categories', [...draft.gallery.categories, 'Нова категорія'])}
                      className="admin-btn-sm mt-2">
                      <Plus size={12} /> Додати категорію
                    </button>
                  </Card>
                </Section>
              )}

              {/* ═══ ARTWORKS ════════════════════════════════════════════════ */}
              {activeTab === 'artworks' && (
                <div>
                  <div className="flex items-center justify-between mb-6 gap-3">
                    <h2 className="font-serif text-xl font-light">
                      Картини
                      <span className="text-gray-400 ml-2 text-base">({artworks.length})</span>
                    </h2>
                    {!newMode && (
                      <button
                        onClick={() => { setNewMode(true); setArtworkForm(emptyArtwork()); setEditingId(null); }}
                        className="admin-btn">
                        <Plus size={13} /> Додати
                      </button>
                    )}
                  </div>

                  {/* New artwork form */}
                  {newMode && (
                    <div className="mb-4">
                      <Card title="Нова картина">
                        <ArtworkForm
                          form={artworkForm}
                          categories={draft.gallery.categories}
                          setForm={setArtworkForm}
                          onSave={async () => {
                            const id = toast.loading('Додавання...');
                            try {
                              await addArtwork(artworkForm);
                              toast.success('Картину додано ✓', { id });
                              setNewMode(false);
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : 'Помилка', { id });
                            }
                          }}
                          onCancel={() => setNewMode(false)}
                        />
                      </Card>
                    </div>
                  )}

                  {/* Artwork list */}
                  <div className="space-y-2">
                    {artworks.map(artwork => (
                      <div key={artwork.id} className="bg-white border border-gray-100 overflow-hidden">
                        {/* Row */}
                        <div className="flex items-center gap-3 p-3 md:p-4">
                          <img
                            src={artwork.image_url}
                            alt={artwork.title}
                            className="w-12 h-14 md:w-14 md:h-16 object-cover flex-shrink-0 bg-gray-50"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-base font-light leading-snug truncate">{artwork.title}</p>
                            <p className="text-xs text-gray-400 font-light truncate">
                              {artwork.year} · {artwork.category} · {artwork.technique}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`hidden sm:block text-xs border px-2 py-0.5 font-light ${
                              artwork.sold ? 'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-200'
                            }`}>
                              {artwork.sold ? 'Продано' : artwork.price ? `${artwork.price.toLocaleString('uk-UA')} ₴` : '—'}
                            </span>
                            <button
                              onClick={() => setEditingId(editingId === artwork.id ? null : artwork.id)}
                              className="text-xs px-3 py-2 border min-h-[44px] flex items-center gap-1 transition-colors border-gray-200 text-gray-400 hover:border-black hover:text-black"
                            >
                              {editingId === artwork.id ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                              <span className="hidden sm:inline">Ред.</span>
                            </button>
                            <button
                              onClick={() => {
                                if (!confirm(`Видалити «${artwork.title}»?`)) return;
                                const id = toast.loading('Видалення...');
                                deleteArtwork(artwork.id)
                                  .then(() => toast.success('Видалено ✓', { id }))
                                  .catch(err => toast.error(err instanceof Error ? err.message : 'Помилка', { id }));
                              }}
                              className="text-gray-300 hover:text-red-400 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Inline edit form */}
                        {editingId === artwork.id && (
                          <div className="border-t border-gray-100 p-4 bg-gray-50">
                            <ArtworkEditForm
                              artwork={artwork}
                              categories={draft.gallery.categories}
                              onSave={async (updates) => {
                                const id = toast.loading('Збереження...');
                                try {
                                  await updateArtwork(artwork.id, updates);
                                  toast.success('Збережено ✓', { id });
                                  setEditingId(null);
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : 'Помилка', { id });
                                }
                              }}
                              onCancel={() => setEditingId(null)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ CONTACT ═════════════════════════════════════════════════ */}
              {activeTab === 'contact' && (
                <Section title="Контакти та форма">
                  <Card title="Контактна інформація">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Телефон">
                        <input className="admin-input" value={draft.contact.phone}
                          onChange={e => set('contact.phone', e.target.value)} />
                      </Field>
                      <Field label="Email">
                        <input className="admin-input" type="email" value={draft.contact.email}
                          onChange={e => set('contact.email', e.target.value)} />
                      </Field>
                      <Field label="Facebook URL">
                        <input className="admin-input" value={draft.contact.facebook_url}
                          onChange={e => set('contact.facebook_url', e.target.value)} />
                      </Field>
                      <Field label="Instagram URL">
                        <input className="admin-input" value={draft.contact.instagram_url}
                          onChange={e => set('contact.instagram_url', e.target.value)} />
                      </Field>
                      <Field label="Місто / Адреса" className="sm:col-span-2">
                        <input className="admin-input" value={draft.contact.address}
                          onChange={e => set('contact.address', e.target.value)} />
                      </Field>
                    </div>
                  </Card>

                  <Card title="Мітки форми">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(Object.entries(draft.form_labels) as [keyof typeof draft.form_labels, string][]).map(([key, val]) => (
                        <Field key={key} label={FORM_LABEL_NAMES[key] ?? key}>
                          <input className="admin-input" value={val}
                            onChange={e => set(`form_labels.${key}`, e.target.value)} />
                        </Field>
                      ))}
                    </div>
                  </Card>
                </Section>
              )}

              {/* ═══ FOOTER ══════════════════════════════════════════════════ */}
              {activeTab === 'footer' && (
                <Section title="Футер">
                  <Card title="Копірайт">
                    <Field label="Текст">
                      <input className="admin-input" value={draft.footer.copyright}
                        onChange={e => set('footer.copyright', e.target.value)} />
                    </Field>
                  </Card>

                  <Card title="Посилання">
                    <div className="space-y-2">
                      {draft.footer.links.map((link, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input className="admin-input flex-1" placeholder="Назва" value={link.label}
                            onChange={e => {
                              const updated = [...draft.footer.links];
                              updated[i] = { ...updated[i], label: e.target.value };
                              set('footer.links', updated);
                            }} />
                          <input className="admin-input w-32 flex-shrink-0" placeholder="#href" value={link.href}
                            onChange={e => {
                              const updated = [...draft.footer.links];
                              updated[i] = { ...updated[i], href: e.target.value };
                              set('footer.links', updated);
                            }} />
                          <button
                            onClick={() => set('footer.links', draft.footer.links.filter((_, j) => j !== i))}
                            className="text-gray-300 hover:text-red-400 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => set('footer.links', [...draft.footer.links, { label: '', href: '#' }])}
                      className="admin-btn-sm mt-2">
                      <Plus size={12} /> Додати посилання
                    </button>
                  </Card>
                </Section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Form label display names ─────────────────────────────────────────────────

const FORM_LABEL_NAMES: Record<string, string> = {
  name_label:          "Мітка поля «Ім'я»",
  name_placeholder:    "Placeholder «Ім'я»",
  email_label:         'Мітка поля «Email»',
  email_placeholder:   'Placeholder «Email»',
  message_label:       'Мітка поля «Повідомлення»',
  message_placeholder: 'Placeholder «Повідомлення»',
  submit_label:        'Текст кнопки «Надіслати»',
  success_message:     'Повідомлення про успіх',
};

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-light pb-3 border-b border-gray-200">{title}</h2>
      {children}
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 p-5 md:p-6 space-y-4">
      <div>
        <p className="text-xs tracking-widest uppercase text-gray-500 font-medium">{title}</p>
        {hint && <p className="text-xs text-gray-400 font-light mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs tracking-widest uppercase text-gray-400 font-light block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ─── Artwork forms ────────────────────────────────────────────────────────────

type ArtworkDraft = Omit<Artwork, 'id' | 'created_at'>;

function ArtworkFields({
  form, setForm, categories,
}: {
  form: ArtworkDraft;
  setForm: (f: ArtworkDraft) => void;
  categories: string[];
}) {
  const set = (k: keyof ArtworkDraft, v: unknown) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      <ImageDropzone
        label="Зображення"
        currentUrl={form.image_url}
        folder="artworks"
        onUploaded={url => set('image_url', url)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Назва">
          <input className="admin-input" value={form.title} onChange={e => set('title', e.target.value)} />
        </Field>
        <Field label="Рік">
          <input className="admin-input" type="number" value={form.year} onChange={e => set('year', +e.target.value)} />
        </Field>
        <Field label="Техніка">
          <input className="admin-input" value={form.technique} onChange={e => set('technique', e.target.value)} />
        </Field>
        <Field label="Розмір">
          <input className="admin-input" value={form.dimensions} onChange={e => set('dimensions', e.target.value)} />
        </Field>
        <Field label="Категорія">
          <select className="admin-input" value={form.category} onChange={e => set('category', e.target.value)}>
            {categories.filter(c => c !== 'Всі').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Ціна (₴)">
          <input className="admin-input" type="number" value={form.price ?? ''}
            placeholder="Без ціни"
            onChange={e => set('price', e.target.value ? +e.target.value : null)} />
        </Field>
      </div>
      <Field label="Опис">
        <textarea className="admin-input resize-none" rows={3} value={form.description}
          onChange={e => set('description', e.target.value)} />
      </Field>
      <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
        <input type="checkbox" checked={form.sold} onChange={e => set('sold', e.target.checked)}
          className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs uppercase tracking-wider text-gray-500 font-light">Картину продано</span>
      </label>
    </div>
  );
}

function ArtworkForm({
  form, categories, setForm, onSave, onCancel,
}: {
  form: ArtworkDraft;
  categories: string[];
  setForm: (f: ArtworkDraft) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <div>
      <ArtworkFields form={form} setForm={setForm} categories={categories} />
      <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
        <button
          onClick={async () => { setSaving(true); await onSave(); setSaving(false); }}
          disabled={saving}
          className="admin-btn">
          {saving ? <span className="spinner" /> : <Check size={13} />}
          Додати картину
        </button>
        <button onClick={onCancel} className="admin-btn-sm">Скасувати</button>
      </div>
    </div>
  );
}

function ArtworkEditForm({
  artwork, categories, onSave, onCancel,
}: {
  artwork: Artwork;
  categories: string[];
  onSave: (updates: Partial<Artwork>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ArtworkDraft>({
    title: artwork.title, year: artwork.year, dimensions: artwork.dimensions,
    technique: artwork.technique, image_url: artwork.image_url, description: artwork.description,
    category: artwork.category, sold: artwork.sold, price: artwork.price, sort_order: artwork.sort_order,
  });
  const [saving, setSaving] = useState(false);
  return (
    <div>
      <ArtworkFields form={form} setForm={setForm} categories={categories} />
      <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
        <button
          onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}
          disabled={saving}
          className="admin-btn">
          {saving ? <span className="spinner" /> : <Check size={13} />}
          Зберегти
        </button>
        <button onClick={onCancel} className="admin-btn-sm">Скасувати</button>
      </div>
    </div>
  );
}
