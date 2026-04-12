'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/lib/settings-context';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/96 backdrop-blur-sm border-b border-gray-100 py-3' : 'bg-transparent py-5 md:py-7'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="#hero" className="flex items-center flex-shrink-0 no-underline">
          {settings.logo.image_url ? (
            <img
              src={settings.logo.image_url}
              alt={settings.logo.text}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span
              className="font-serif font-light tracking-widest text-black"
              style={{ fontSize: settings.logo.font_size || '0.95rem', letterSpacing: '0.18em' }}
            >
              {settings.logo.text}
            </span>
          )}
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {settings.nav_links.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-5">
          <button className="nav-link flex items-center gap-1.5" aria-label="Мова">
            <span className="w-4 h-4 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 flex flex-col">
              <span className="block flex-1 bg-blue-600" />
              <span className="block flex-1 bg-yellow-400" />
            </span>
            <span>UA</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-600 p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Меню"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="px-5 py-5 flex flex-col gap-1">
              {settings.nav_links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="nav-link py-3 text-sm min-h-[44px] flex items-center"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}