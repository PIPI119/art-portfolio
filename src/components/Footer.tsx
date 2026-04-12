'use client';

import { useSettings } from '@/lib/settings-context';

export default function Footer() {
  const { settings } = useSettings();
  const { footer } = settings;

  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <nav className="flex items-center gap-5 flex-wrap justify-center">
          {footer.links.map(link => (
            <a
              key={link.href} href={link.href}
              className="text-xs tracking-wider uppercase text-gray-400 hover:text-black transition-colors font-light min-h-[40px] flex items-center"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <p className="text-xs text-gray-400 font-light text-center">{footer.copyright}</p>
      </div>
    </footer>
  );
}
