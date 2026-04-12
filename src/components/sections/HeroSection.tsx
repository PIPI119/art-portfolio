'use client';

import { useSettings } from '@/lib/settings-context';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
};

export default function HeroSection() {
  const { settings } = useSettings();
  const headingLines = settings.hero.heading.split('\n');

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden bg-white"
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Side lines — desktop only */}
      <div className="absolute left-7 top-0 bottom-0 w-px bg-gray-100 hidden lg:block" />
      <div className="absolute right-7 top-0 bottom-0 w-px bg-gray-100 hidden lg:block" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 w-full pt-28 md:pt-36 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-9">
            <motion.p
              custom={0.05}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-xs tracking-[0.3em] uppercase font-inter text-gray-400 font-light mb-4"
            >
              {settings.artist.first_name} {settings.artist.last_name}
            </motion.p>

            <h1
              className="font-serif font-light leading-[0.9] mb-6 md:mb-8"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 9.5rem)' }}
            >
              {headingLines.map((line, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.span
                    custom={0.1 + i * 0.12}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="block"
                  >
                    {line}
                  </motion.span>
                </div>
              ))}
            </h1>

            <motion.div
              custom={0.38}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-5 mb-6 md:mb-8"
            >
              <div className="h-px w-10 bg-gray-300 flex-shrink-0" />
              <p className="font-serif italic text-gray-400 text-lg md:text-xl font-light">
                {settings.hero.subheading}
              </p>
            </motion.div>

            <motion.p
              custom={0.5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-gray-400 font-light leading-relaxed max-w-sm text-sm"
            >
              {settings.hero.blurb}
            </motion.p>
          </div>

          {/* Large decorative numeral — hidden on mobile */}
          <div className="lg:col-span-3 hidden lg:flex justify-end items-end pb-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="font-serif leading-none font-light text-gray-100 select-none"
              style={{ fontSize: 'clamp(5rem, 10vw, 9rem)' }}
            >
              I
            </motion.span>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center"
      >
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-gray-300 hover:text-black transition-colors group min-h-[44px] justify-center"
        >
          <span className="text-xs tracking-[0.2em] uppercase font-light">Далі</span>
          <ChevronDown size={15} className="animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
