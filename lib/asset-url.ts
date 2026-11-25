/**
 * Penyimpanan gambar admin (QRIS) ada di Supabase Storage. Modul ini aman
 * diimpor dari server maupun browser: tidak membaca env dan tidak memakai crypto.
 */

export const ASSET_BUCKET = "turvano-assets";

/** Semua unggahan admin masuk ke folder ini. */
export const ASSET_FOLDER = "qris";

const PUBLIC_MARKER = `/storage/v1/object/public/${ASSET_BUCKET}/`;

/**
 * Mengambil path objek dari URL publik, mis.
 * `https://<ref>.supabase.co/storage/v1/object/public/turvano-assets/qris/abc.png`
 * menjadi `qris/abc.png`. Mengembalikan null untuk URL lain, termasuk data URL
 * base64 lama yang mungkin masih tersimpan di baris pengaturan.
 */
export function assetPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const index = url.indexOf(PUBLIC_MARKER);
  if (index === -1) return null;
  const path = url.slice(index + PUBLIC_MARKER.length).split("?")[0];
  return path || null;
}
