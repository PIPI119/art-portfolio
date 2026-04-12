'use client';

import { useState, useRef, useCallback, memo } from 'react';
import { useSettings } from '@/lib/settings-context';
import { useArtworks } from '@/lib/artworks-context';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Artwork } from '@/types';

// ─── ArtworkCard — memoized so 40 cards don't re-render on filter change ─────
const ArtworkCard = memo(function ArtworkCard({
  artwork,
  onClick,
}: {
  artwork: Artwork;
  onClick: (a: Artwork) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  // Each card fades in when it enters the viewport — no staggered delay on index
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="artwork-card group text-left bg-white border border-gray-100 overflow-hidden w-full"
      onClick={() => onClick(artwork)}
      // content-visibility: auto skips layout/paint for off-screen cards
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 320px' }}
    >
      {/* Image wrapper with explicit aspect ratio */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '3/4' }}>
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          // Give browser sizing hints so it can allocate space before load
          width={300}
          height={400}
        />
        {artwork.sold && (
          <div className="absolute top-3 right-3 bg-black text-white text-xs px-2 py-1 tracking-wider font-light pointer-events-none">
            Продано
          </div>
        )}
      </div>
      <div className="p-3 md:p-4">
        <h3 className="font-serif font-light text-base md:text-lg leading-snug mb-0.5 truncate">
          {artwork.title}
        </h3>
        <p className="text-xs text-gray-400 font-light truncate">
          {artwork.year} · {artwork.technique}
        </p>
        {!artwork.sold && artwork.price != null && (
          <p className="text-xs text-gray-600 mt-1 font-light">
            {artwork.price.toLocaleString('uk-UA')} ₴
          </p>
        )}
      </div>
    </motion.button>
  );
});

// ─── Skeleton card for loading state ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 overflow-hidden">
      <div className="skeleton" style={{ aspectRatio: '3/4' }} />
      <div className="p-3 md:p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded-none" />
        <div className="skeleton h-3 w-1/2 rounded-none" />
      </div>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  artwork,
  all,
  onClose,
  onPrev,
  onNext,
}: {
  artwork: Artwork;
  all: Artwork[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const idx = all.findIndex(a => a.id === artwork.id);
  const hasPrev = idx > 0;
  const hasNext = idx < all.length - 1;

  // Keyboard navigation
  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
      onKeyDown={handleKey}
      tabIndex={0}
      // Auto-focus so keyboard works immediately
      ref={el => el?.focus()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-white w-full max-w-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        style={{ maxHeight: '90svh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50" style={{ minHeight: 200 }}>
          <img
            key={artwork.id}
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full h-full object-cover"
            style={{ maxHeight: '55svh' }}
            loading="eager"
          />
          {/* Prev / Next arrows */}
          {hasPrev && (
            <button
              onClick={e => { e.stopPropagation(); onPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Попередня"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {hasNext && (
            <button
              onClick={e => { e.stopPropagation(); onNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Наступна"
            >
              <ChevronRight size={16} />
            </button>
          )}
          {/* Counter */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 font-light">
            {idx + 1} / {all.length}
          </div>
        </div>

        {/* Info panel */}
        <div className="p-5 md:p-8 flex flex-col justify-between overflow-y-auto" style={{ maxHeight: '90svh' }}>
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-serif font-light" style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)' }}>
                {artwork.title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-black min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0 transition-colors"
                aria-label="Закрити"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-5 font-light">
              {artwork.year} · {artwork.category}
            </p>
            <div className="space-y-2 text-sm text-gray-500 font-light">
              {artwork.technique  && <p><span className="text-gray-300">Техніка:&nbsp;</span>{artwork.technique}</p>}
              {artwork.dimensions && <p><span className="text-gray-300">Розмір:&nbsp;</span>{artwork.dimensions}</p>}
              {artwork.description && <p className="mt-4 leading-relaxed text-gray-400">{artwork.description}</p>}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            {artwork.sold ? (
              <span className="text-xs tracking-widest uppercase text-gray-400">Продано</span>
            ) : artwork.price != null ? (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="font-serif font-light" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}>
                  {artwork.price.toLocaleString('uk-UA')} ₴
                </span>
                <a
                  href="#contact"
                  onClick={onClose}
                  className="text-xs tracking-widest uppercase border border-black px-5 py-3 hover:bg-black hover:text-white transition-colors min-h-[44px] flex items-center"
                >
                  Придбати
                </a>
              </div>
            ) : (
              <span className="text-xs tracking-widest uppercase text-gray-400">Ціна за запитом</span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Gallery Section ─────────────────────────────────────────────────────
export default function GallerySection() {
  const { settings } = useSettings();
  const { artworks, loading } = useArtworks();
  const [activeCategory, setActiveCategory]   = useState('Всі');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  const categories = settings.gallery.categories;

  const filtered = activeCategory === 'Всі'
    ? artworks
    : artworks.filter(a => a.category === activeCategory);

  const available = artworks.filter(a => !a.sold).length;
  const soldCount = artworks.filter(a =>  a.sold).length;

  // Lightbox navigation within the filtered list
  const handlePrev = useCallback(() => {
    if (!selectedArtwork) return;
    const idx = filtered.findIndex(a => a.id === selectedArtwork.id);
    if (idx > 0) setSelectedArtwork(filtered[idx - 1]);
  }, [selectedArtwork, filtered]);

  const handleNext = useCallback(() => {
    if (!selectedArtwork) return;
    const idx = filtered.findIndex(a => a.id === selectedArtwork.id);
    if (idx < filtered.length - 1) setSelectedArtwork(filtered[idx + 1]);
  }, [selectedArtwork, filtered]);

  const handleCardClick = useCallback((a: Artwork) => setSelectedArtwork(a), []);

  return (
    <section id="gallery" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">

          {/* Side label — desktop */}
          <div className="hidden lg:flex lg:col-span-1 items-start justify-start pt-2">
            <span className="section-label">{settings.gallery.section_title}</span>
          </div>

          <div className="lg:col-span-11">
            {/* Mobile label */}
            <div className="lg:hidden mb-3">
              <span className="text-xs tracking-[0.25em] uppercase text-gray-400 font-light">
                {settings.gallery.section_title}
              </span>
            </div>

            {/* Header */}
            <div ref={headerRef}>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="mb-10 md:mb-14"
              >
                <h2
                  className="font-serif font-light leading-tight mb-2"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                >
                  {settings.gallery.heading}
                </h2>
                <p className="text-gray-400 text-xs font-light tracking-wider">
                  {settings.gallery.subheading}
                </p>
              </motion.div>
            </div>

            {/* Mobile category pills — horizontal scroll, no overflow clip */}
            <div
              className="flex gap-3 mb-8 lg:hidden"
              style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}
            >
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    flex-shrink-0 text-xs uppercase tracking-wider px-4 py-2.5 border min-h-[44px] transition-colors
                    ${activeCategory === cat
                      ? 'border-black text-black bg-black text-white'
                      : 'border-gray-200 text-gray-400 hover:border-gray-600 hover:text-gray-600'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Desktop: sidebar + grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12">

              {/* Sidebar — desktop only */}
              <aside className="hidden lg:block lg:col-span-1">
                <p className="text-xs tracking-widest uppercase text-gray-400 mb-4 font-light">
                  Категорії
                </p>
                <div className="flex flex-col gap-0.5 mb-8">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                    >
                      {cat}
                      {cat !== 'Всі' && (
                        <span className="ml-auto text-gray-300 font-light">
                          {artworks.filter(a => a.category === cat).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-5 space-y-3">
                  {[
                    { label: 'Всього',   val: artworks.length },
                    { label: 'Доступно', val: available        },
                    { label: 'Продано',  val: soldCount        },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-light">{label}</span>
                      <span className="font-serif text-xl font-light">{val}</span>
                    </div>
                  ))}
                </div>
              </aside>

              {/* Grid */}
              <div className="lg:col-span-3">
                {loading ? (
                  // Skeleton grid while data loads
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-gray-400 font-light text-sm">
                    Робіт у цій категорії немає.
                  </p>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      // CSS grid — browser handles layout, not JS
                      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
                    >
                      {filtered.map(artwork => (
                        <ArtworkCard
                          key={artwork.id}
                          artwork={artwork}
                          onClick={handleCardClick}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedArtwork && (
          <Lightbox
            artwork={selectedArtwork}
            all={filtered}
            onClose={() => setSelectedArtwork(null)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
