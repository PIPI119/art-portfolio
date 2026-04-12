'use client';

import { useRef } from 'react';
import { useSettings } from '@/lib/settings-context';
import { Package, BarChart3, Award, Users } from 'lucide-react';
import { StatCounter } from '@/types';
import { motion, useInView } from 'framer-motion';

const ICONS: Record<StatCounter['icon'], React.FC<{ size?: number; className?: string; strokeWidth?: number }>> = {
  package:    Package,
  'bar-chart': BarChart3,
  award:      Award,
  users:      Users,
};

export default function StatsSection() {
  const { settings } = useSettings();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="bg-gray-50 border-y border-gray-100" ref={ref}>
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200">
          {settings.stats.map((stat, i) => {
            const Icon = ICONS[stat.icon] ?? Package;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.08 }}
                className="bg-gray-50 py-10 md:py-14 px-6 flex flex-col items-center text-center gap-3"
              >
                <Icon size={20} className="text-gray-300" strokeWidth={1.5} />
                <span
                  className="font-serif font-light text-black leading-none"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
                >
                  {stat.value}
                </span>
                <span className="text-xs tracking-widest uppercase font-light text-gray-400">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
