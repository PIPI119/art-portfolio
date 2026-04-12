import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '@/lib/settings-context';
import { ArtworksProvider } from '@/lib/artworks-context';
import { Toaster } from 'sonner';

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Анастасія Грудка — Художниця',
  description: 'Портфоліо живопису та графіки Анастасії Грудки — художниці з Одеси',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased">
        <SettingsProvider>
          <ArtworksProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.8rem',
                  letterSpacing: '0.02em',
                  border: '1px solid #e8e8e6',
                  borderRadius: '0',
                  background: '#fafaf8',
                  color: '#0a0a0a',
                },
              }}
            />
          </ArtworksProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
