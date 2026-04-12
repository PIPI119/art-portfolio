import { supabase, isSupabaseConfigured } from './supabase';
import { UploadResult } from '@/types';

const BUCKET = 'portfolio-images';

/**
 * Upload a single image file to Supabase Storage.
 * Returns the public URL and storage path.
 *
 * Throws a descriptive Error on failure — caller should show a toast.
 */
export async function uploadImage(
  file: File,
  folder: 'logos' | 'portraits' | 'artworks'
): Promise<UploadResult> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase не налаштовано. Перевірте .env.local — мають бути ' +
      'NEXT_PUBLIC_SUPABASE_URL та NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  // Sanitize filename: replace anything that isn't alphanumeric/dot/dash/underscore
  const safeName = file.name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._\-]/g, '')
    .replace(/_{2,}/g, '_')
    .toLowerCase();

  const ext  = safeName.split('.').pop() ?? 'jpg';
  const base = safeName.replace(`.${ext}`, '').slice(0, 60); // cap filename length
  const path = `${folder}/${Date.now()}_${base}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '31536000', // 1 year — images are immutable (new path = new file)
      upsert:       false,
      contentType:  file.type || 'image/jpeg',
    });

  if (uploadError) {
    // Surface the exact Supabase Storage error
    throw new Error(
      `Storage error (${uploadError.name}): ${uploadError.message}. ` +
      'Перевірте що bucket "portfolio-images" існує і має публічний доступ.'
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error(
      'Файл завантажено, але не вдалося отримати публічний URL. ' +
      'Перевірте RLS-полісі для bucket "portfolio-images".'
    );
  }

  return { url: data.publicUrl, path };
}

/**
 * Delete a file from Supabase Storage by its storage path (not URL).
 * Fails silently — deletion errors shouldn't block the UI.
 */
export async function deleteImage(path: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.warn(`[Storage] Delete failed for "${path}":`, error.message);
  }
}

/**
 * Extract the storage path from a full public URL.
 * Useful when you have the URL but need the path for deletion.
 */
export function extractStoragePath(publicUrl: string): string | null {
  try {
    const url   = new URL(publicUrl);
    // Public URL format: .../storage/v1/object/public/BUCKET/PATH
    const parts = url.pathname.split(`/object/public/${BUCKET}/`);
    return parts[1] ?? null;
  } catch {
    return null;
  }
}
