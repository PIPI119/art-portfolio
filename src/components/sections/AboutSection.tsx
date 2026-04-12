'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useSettings } from '@/lib/settings-context';
import { motion, useInView } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94], delay } },
});

export default function AboutSection() {
  const { settings } = useSettings();
  const { biography } = settings;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="py-20 md:py-32 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          {/* Side label — hidden on mobile */}
          <div className="hidden lg:flex lg:col-span-1 items-start justify-start pt-2">
            <span className="section-label">{biography.section_title}</span>
          </div>

          {/* Mobile section label */}
          <div className="lg:hidden">
            <span className="text-xs tracking-[0.25em] uppercase text-gray-400 font-light">
              {biography.section_title}
            </span>
          </div>

          <div className="lg:col-span-11">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              {/* Left — heading + portrait */}
              <motion.div
                variants={fadeUp(0)}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
              >
                <h2
                  className="font-serif font-light leading-tight mb-6"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                >
                  {biography.heading}
                </h2>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-10 bg-gray-300 flex-shrink-0" />
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                {/* Portrait */}
                {biography.portrait_url && (
                  <motion.div
                    variants={fadeUp(0.15)}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                    className="relative w-full max-w-sm aspect-[3/4] overflow-hidden border border-gray-100"
                  >
                    <img
                      src={biography.portrait_url}
                      alt={`${settings.artist.first_name} ${settings.artist.last_name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                )}
              </motion.div>

              {/* Right — paragraphs */}
              <motion.div
                variants={fadeUp(0.12)}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="space-y-5"
              >
                {biography.paragraphs.map((para, i) => (
                  <p key={i} className="text-gray-500 leading-relaxed font-light text-sm">
                    {para}
                  </p>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
