import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Адмін — Anastasiia Hrudka',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
