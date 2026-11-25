/**
 * Panggilan unggah gambar dari browser. File dikirim ke /api/admin/upload,
 * yang menyimpannya ke Supabase Storage dengan kunci server.
 */

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_IMAGE_LABEL = "JPG, PNG, atau WebP";

/**
 * Mengembalikan alasan yang mudah dibaca bila file tidak bisa diterima, atau
 * null bila aman. Dicek sebelum unggah supaya file buruk tidak membuang transfer.
 */
export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return `Format tidak didukung. Gunakan ${ACCEPTED_IMAGE_LABEL}.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `Ukuran file ${mb} MB melebihi batas 2 MB. Kompres dulu gambarnya.`;
  }
  return null;
}

/** Mengunggah gambar dan melaporkan kemajuan 0–100. */
export function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ url: string; path: string }> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/upload");

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    request.onerror = () => reject(new Error("Koneksi terputus saat mengunggah."));

    request.onload = () => {
      let data: { url?: string; path?: string; error?: string } | null = null;
      try {
        data = JSON.parse(request.responseText);
      } catch {
        /* biarkan pesan umum */
      }
      if (request.status < 200 || request.status >= 300 || !data?.url || !data.path) {
        reject(new Error(data?.error ?? "Gagal mengunggah gambar."));
        return;
      }
      resolve({ url: data.url, path: data.path });
    };

    request.send(body);
  });
}

/**
 * Menghapus gambar yang sudah diganti. Kegagalan sengaja diabaikan pemanggil:
 * berkas yatim hanya memakan sedikit ruang, tapi tidak boleh menghalangi
 * penyimpanan yang mengikutinya.
 */
export async function deleteUploadedAsset(path: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/upload?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch {
    return false;
  }
}
