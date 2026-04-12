'use client';

import { useState, useRef } from 'react';
import { useSettings } from '@/lib/settings-context';
import { useArtworks } from '@/lib/artworks-context'; // Подключаем картины
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

export default function ContactSection() {
  const { settings } = useSettings();
  const { artworks } = useArtworks(); // Достаем список картин
  const { contact, form_labels } = settings;
  
  // Изменили email на phone и добавили artwork
  const [form, setForm] = useState({ name: '', phone: '', artwork: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // Добавили стейт загрузки
  
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Отправляем в Telegram
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Помилка відправки');
      
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setForm({ name: '', phone: '', artwork: '', message: '' }); // Очищаем форму
    } catch (error) {
      alert('Помилка відправки. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-white border-t border-gray-100" ref={ref}>
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">

          {/* Side label — desktop only */}
          <div className="hidden lg:flex lg:col-span-1 items-start justify-start pt-2">
            <span className="section-label">Контакти</span>
          </div>

          <div className="lg:col-span-11">
            {/* Mobile label */}
            <div className="lg:hidden mb-2">
              <span className="text-xs tracking-[0.25em] uppercase text-gray-400 font-light">Контакти</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Left — info (ОСТАЛОСЬ БЕЗ ИЗМЕНЕНИЙ) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                <h2
                  className="font-serif font-light leading-tight mb-8 md:mb-10"
                  style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3rem)' }}
                >
                  Зв'яжіться зі мною
                </h2>

                <div className="space-y-5">
                  {contact.phone && (
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Phone size={13} className="text-gray-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-xs tracking-widest uppercase text-gray-400 mb-0.5 font-light">Телефон</p>
                        <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-sm text-gray-600 hover:text-black transition-colors font-light">
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Mail size={13} className="text-gray-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-xs tracking-widest uppercase text-gray-400 mb-0.5 font-light">Пошта</p>
                        <a href={`mailto:${contact.email}`} className="text-sm text-gray-600 hover:text-black transition-colors font-light">
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <MapPin size={13} className="text-gray-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-xs tracking-widest uppercase text-gray-400 mb-0.5 font-light">Місто</p>
                        <p className="text-sm text-gray-600 font-light">{contact.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social */}
                <div className="mt-8 flex items-center gap-3">
                  {contact.facebook_url && (
                    <a href={contact.facebook_url} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:border-black hover:text-black transition-colors text-gray-400"
                      aria-label="Facebook">
                      <Facebook size={13} strokeWidth={1.5} />
                    </a>
                  )}
                  {contact.instagram_url && (
                    <a href={contact.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:border-black hover:text-black transition-colors text-gray-400"
                      aria-label="Instagram">
                      <Instagram size={13} strokeWidth={1.5} />
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Right — form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.12 }}
              >
                {submitted ? (
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <p className="font-serif font-light text-center text-gray-500" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
                      {form_labels.success_message}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-7">
                    <div>
                      <label className="text-xs tracking-widest uppercase text-gray-400 font-light block mb-2">
                        {form_labels.name_label}
                      </label>
                      <input
                        type="text" required
                        placeholder={form_labels.name_placeholder}
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="contact-input"
                      />
                    </div>
                    
                    {/* ТЕЛЕФОН ВМЕСТО ПОЧТЫ */}
                    <div>
                      <label className="text-xs tracking-widest uppercase text-gray-400 font-light block mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel" required
                        placeholder="Ваш номер телефону"
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className="contact-input"
                      />
                    </div>

                    {/* ВЫБОР КАРТИНЫ */}
                    <div>
                      <label className="text-xs tracking-widest uppercase text-gray-400 font-light block mb-2">
                        Яка картина вас цікавить? (необов'язково)
                      </label>
                      <select
                        value={form.artwork}
                        onChange={e => setForm(p => ({ ...p, artwork: e.target.value }))}
                        className="contact-input bg-transparent cursor-pointer appearance-none"
                      >
                        <option value="" className="text-gray-500">Оберіть картину...</option>
                        {artworks.map(art => (
                          <option key={art.id} value={art.title} className="text-black">
                            {art.title} {art.year ? `(${art.year})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs tracking-widest uppercase text-gray-400 font-light block mb-2">
                        {form_labels.message_label}
                      </label>
                      <textarea
                        required rows={4}
                        placeholder={form_labels.message_placeholder}
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        className="contact-input resize-none"
                        style={{ minHeight: '120px' }}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="text-xs tracking-widest uppercase border border-black px-8 py-3 hover:bg-black hover:text-white transition-all duration-300 font-light min-h-[48px] flex items-center disabled:opacity-50"
                    >
                      {loading ? 'Відправка...' : form_labels.submit_label}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}