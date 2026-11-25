import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { apiError, requireAdmin, serverError } from "@/lib/api";
import { ASSET_BUCKET, ASSET_FOLDER } from "@/lib/asset-url";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Memastikan isi file benar-benar gambar, bukan sekadar header tipe dari klien. */
function looksLikeImage(bytes: Uint8Array, type: string): boolean {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/webp") {
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    return riff === "RIFF" && webp === "WEBP";
  }
  return false;
}

/** Mengunggah satu gambar ke bucket Supabase Storage dan mengembalikan URL publiknya. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return apiError("File gambar wajib diisi.");

    const extension = EXTENSIONS[file.type];
    if (!extension) return apiError("Format tidak didukung. Gunakan JPG, PNG, atau WebP.");
    if (file.size > MAX_BYTES) return apiError("Ukuran file melebihi batas 2 MB.");

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!looksLikeImage(buffer, file.type)) return apiError("Isi file bukan gambar yang valid.");

    const path = `${ASSET_FOLDER}/${Date.now()}-${randomBytes(4).toString("hex")}.${extension}`;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(ASSET_BUCKET).upload(path, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (error) {
    return serverError(error);
  }
}

/**
 * Menghapus satu gambar yang sudah diganti. Path dibatasi ke folder unggahan
 * sendiri, jadi sesi admin yang bocor pun tidak bisa menghapus berkas lain.
 */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const path = new URL(request.url).searchParams.get("path")?.trim();
  if (!path) return apiError("path wajib diisi.");
  if (!path.startsWith(`${ASSET_FOLDER}/`) || path.includes("..")) {
    return apiError("Berkas di luar folder unggahan tidak boleh dihapus.", 403);
  }

  try {
    const { error } = await getSupabaseAdmin().storage.from(ASSET_BUCKET).remove([path]);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
