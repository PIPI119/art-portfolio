'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { uploadImage } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

interface ImageDropzoneProps {
  currentUrl?:  string;
  folder:       'logos' | 'portraits' | 'artworks';
  onUploaded:   (url: string) => void;
  label?:       string;
  aspectRatio?: string;
}

export default function ImageDropzone({
  currentUrl,
  folder,
  onUploaded,
  label,
  aspectRatio,
}: ImageDropzoneProps) {
  const [preview,  setPreview]  = useState<string>(currentUrl ?? '');
  const [state,    setState]    = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    // ПРАВКА: Заменили сложный тип на any[], чтобы TypeScript не мешал сборке
    async (accepted: File[], rejected: any[]) => {
      // Handle rejected files (wrong type or too large)
      rejected.forEach(({ file, errors }) => {
        const reason = errors.map((e: any) => e.message).join(', ');
        toast.error(`«${file.name}» відхилено: ${reason}`);
      });

      const file = accepted[0];
      if (!file) return;

      // Validate dimensions / size client-side
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Файл занадто великий. Максимум 20 МБ.');
        return;
      }

      // Show instant local preview
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      setState('uploading');
      setProgress(10);

      if (!isSupabaseConfigured) {
        // Graceful fallback: use object URL (won't persist after reload)
        onUploaded(localUrl);
        setState('done');
        setProgress(100);
        toast.warning('Supabase не налаштовано — зображення збережено лише локально.');
        return;
      }

      try {
        // Fake progress ticks while upload runs
        const ticker = setInterval(() => {
          setProgress(p => (p < 85 ? p + 8 : p));
        }, 200);

        const result = await uploadImage(file, folder);

        clearInterval(ticker);
        setProgress(100);
        setPreview(result.url);
        onUploaded(result.url);
        setState('done');
        toast.success('Зображення завантажено ✓');

        // Reset done state after 2s
        setTimeout(() => setState('idle'), 2000);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setState('error');
        setProgress(0);
        setPreview(currentUrl ?? '');
        toast.error(`Помилка завантаження: ${msg}`);
        setTimeout(() => setState('idle'), 3000);
      }
    },
    [folder, onUploaded, currentUrl]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    noClick: !!preview && state === 'idle', // when image shown, clicks go to overlay buttons
  });

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview('');
    onUploaded('');
    setState('idle');
    setProgress(0);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-xs tracking-widest uppercase text-gray-400 font-light">{label}</p>
      )}

      {preview ? (
        // ── Image preview with overlay controls ──
        <div
          className="relative group border border-gray-100 overflow-hidden bg-gray-50"
          style={aspectRatio ? { aspectRatio } : { maxHeight: 180 }}
        >
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
            style={aspectRatio ? {} : { maxHeight: 180, objectFit: 'cover' }}
          />

          {/* Upload progress bar */}
          {state === 'uploading' && (
            <div className="absolute inset-0 bg-white/75 flex flex-col items-center justify-center gap-2">
              <span className="spinner" />
              <div className="w-32 h-1 bg-gray-200 rounded-none overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 font-light">{progress}%</p>
            </div>
          )}

          {/* Done tick */}
          {state === 'done' && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <div className="bg-black rounded-full p-1.5">
                <Check size={14} className="text-white" />
              </div>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-400" />
            </div>
          )}

          {/* Hover overlay — only when idle */}
          {state === 'idle' && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button
                  type="button"
                  onClick={open}
                  className="bg-white text-black text-xs px-3 py-2.5 uppercase tracking-wider border border-black hover:bg-black hover:text-white transition-colors min-h-[40px]"
                >
                  Замінити
                </button>
              </div>
              <button
                type="button"
                onClick={clear}
                className="bg-white text-black p-2.5 border border-gray-300 hover:border-red-400 hover:text-red-400 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Видалити зображення"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        // ── Drop zone ──
        <div
          {...getRootProps()}
          className={`dropzone flex-col gap-2 p-5 min-h-[88px] ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />

          {state === 'uploading' ? (
            <div className="flex flex-col items-center gap-2 w-full pointer-events-none">
              <span className="spinner" />
              <div className="w-32 h-1 bg-gray-200 overflow-hidden">
                <div className="h-full bg-black transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-400 font-light">{progress}%</p>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center gap-1.5 pointer-events-none">
              <ImageIcon size={22} className="text-gray-500" />
              <p className="text-xs text-gray-500 font-light">Відпустіть файл тут</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 pointer-events-none text-center">
              <Upload size={18} className="text-gray-300" />
              <p className="text-xs text-gray-400 font-light">
                Перетягніть фото або{' '}
                <span className="underline underline-offset-2">натисніть</span>
              </p>
              <p className="text-xs text-gray-300">JPG · PNG · WEBP · до 20 МБ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}