"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toPublicImageSrc } from "@/lib/product-image";

type ImageUploaderProps = {
  /** URL actual guardada en BD (puede ser vacío si no hay imagen propia) */
  currentUrl?: string;
  /** Imagen placeholder según categoría para mostrar si no hay foto propia */
  placeholderUrl: string;
  /** name del input hidden que recibirá la URL final para el Server Action */
  inputName?: string;
  disabled?: boolean;
};

export function ImageUploader({
  currentUrl,
  placeholderUrl,
  inputName = "imageUrl",
  disabled = false,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(
    currentUrl ? toPublicImageSrc(currentUrl) : "",
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displaySrc = preview || placeholderUrl;
  const isPlaceholder = !preview;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/product-image", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Error al subir la imagen.");
        setPreview(currentUrl || "");
        return;
      }

      URL.revokeObjectURL(objectUrl);
      setPreview(data.url);
    } catch {
      setError("Error de red al subir la imagen.");
      setPreview(currentUrl || "");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openPicker() {
    if (!disabled && !uploading) fileInputRef.current?.click();
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={inputName} value={preview} />

      <button
        type="button"
        disabled={disabled || uploading}
        onClick={openPicker}
        className={`group relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border-2 text-left transition ${
          isPlaceholder
            ? "border-dashed border-emerald-400 bg-emerald-50/40"
            : "border-stone-200 bg-stone-100"
        } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:border-emerald-600"}`}
        aria-label={preview ? "Cambiar foto del producto" : "Subir foto del producto"}
      >
        <Image
          src={displaySrc}
          alt="Imagen del producto"
          fill
          sizes="(max-width: 640px) 100vw, 448px"
          unoptimized={displaySrc.startsWith("/uploads/") || displaySrc.startsWith("blob:")}
          className={`object-cover ${isPlaceholder ? "opacity-40" : ""}`}
        />

        {isPlaceholder && !uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-emerald-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium">Pulsa para subir la foto</span>
            <span className="text-xs text-emerald-900/70">
              Sin foto propia · se muestra la de categoría
            </span>
          </div>
        ) : null}

        {!isPlaceholder && !disabled && !uploading ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
            <span className="text-sm font-medium text-white">Cambiar foto</span>
          </div>
        ) : null}

        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75">
            <span className="text-sm font-medium text-stone-700">Subiendo…</span>
          </div>
        ) : null}
      </button>

      {!disabled ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={openPicker}
            className="min-h-10 rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-60"
          >
            {uploading ? "Subiendo…" : preview ? "Cambiar foto" : "Subir foto"}
          </button>
          {!isPlaceholder ? (
            <button
              type="button"
              onClick={handleRemove}
              className="min-h-10 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Quitar foto
            </button>
          ) : null}
          <span className="text-xs text-stone-500">JPG, PNG o WebP · máx. 5 MB</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!error && preview ? (
        <p className="text-xs text-stone-500">
          Foto lista. Pulsa «Guardar cambios» abajo para publicarla en la ficha.
        </p>
      ) : null}
    </div>
  );
}
