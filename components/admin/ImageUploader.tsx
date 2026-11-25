"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCEPTED_IMAGE_LABEL,
  MAX_IMAGE_BYTES,
  uploadImage,
  validateImageFile,
} from "@/lib/upload-client";

type Props = {
  /** Element id, so the visible label stays associated with the control. */
  id: string;
  label: string;
  /** The URL currently stored. May be a legacy base64 data URL. */
  value: string;
  /** Called once the file has been stored. */
  onUploaded: (url: string) => void;
  /** Called when the admin asks to drop the image. */
  onCleared?: () => void;
  clearLabel?: string;
  disabled?: boolean;
};

type Phase = "idle" | "uploading" | "error";

/**
 * Drag-and-drop image field that uploads to Supabase Storage via the server.
 *
 * The preview exists twice on purpose: a local object URL the instant a file
 * is picked, then the stored URL once the upload lands. The
 * local preview is what makes the wait feel short, and it is revoked as soon
 * as the real asset replaces it.
 */
export function ImageUploader({
  id,
  label,
  value,
  onUploaded,
  onCleared,
  clearLabel = "Hapus Gambar",
  disabled = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [dragover, setDragover] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState("");

  // Object URLs leak if the component unmounts mid-upload.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function clearLocalPreview() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setLocalPreview("");
  }

  async function handleFile(file: File) {
    if (disabled || phase === "uploading") return;

    const rejection = validateImageFile(file);
    if (rejection) {
      setError(rejection);
      setPhase("error");
      return;
    }

    clearLocalPreview();
    objectUrlRef.current = URL.createObjectURL(file);
    setLocalPreview(objectUrlRef.current);
    setError("");
    setPercent(0);
    setPhase("uploading");

    try {
      const { url } = await uploadImage(file, setPercent);
      clearLocalPreview();
      setPhase("idle");
      onUploaded(url);
    } catch (uploadError) {
      // The previous image stays in place: a failed upload must never cost
      // the admin the asset they already had.
      clearLocalPreview();
      setError(uploadError instanceof Error ? uploadError.message : "Gagal mengunggah gambar.");
      setPhase("error");
    }
  }

  function openPicker() {
    if (!disabled && phase !== "uploading") fileInputRef.current?.click();
  }

  const busy = phase === "uploading";
  const shownImage = localPreview || value;

  return (
    <div className="img-upload">
      <label className="form-label-admin" htmlFor={id}>
        {label}
      </label>

      {shownImage ? (
        <div className="img-upload-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={localPreview || value}
            alt={`Pratinjau ${label}`}
            className="img-upload-preview-img"
            loading="lazy"
          />
          {busy && (
            <div className="img-upload-overlay" role="status" aria-live="polite">
              <span>Mengunggah… {percent}%</span>
              <span className="img-upload-bar">
                <span className="img-upload-bar-fill" style={{ width: `${percent}%` }} />
              </span>
            </div>
          )}
        </div>
      ) : null}

      <div
        className={`img-upload-drop${dragover ? " dragover" : ""}${busy ? " busy" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragover(true);
        }}
        onDragLeave={() => setDragover(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragover(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
      >
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <div className="img-upload-drop-title">
          {busy ? "Sedang mengunggah…" : shownImage ? "Tarik file baru untuk mengganti" : "Klik atau tarik gambar ke sini"}
        </div>
        <div className="img-upload-drop-sub">
          {ACCEPTED_IMAGE_LABEL}, maksimal {Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB.
        </div>

        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || busy}
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            // Reset so picking the same file twice still fires onChange.
            event.target.value = "";
          }}
        />
      </div>

      {error && (
        <div className="img-upload-error" role="alert">
          {error}
        </div>
      )}

      {(shownImage || onCleared) && (
        <div className="img-upload-actions">
          <button type="button" className="btn-secondary-admin" onClick={openPicker} disabled={busy}>
            {shownImage ? "Ganti Gambar" : "Pilih Gambar"}
          </button>
          {shownImage && onCleared && (
            <button type="button" className="btn-danger-admin" onClick={onCleared} disabled={busy}>
              {clearLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
