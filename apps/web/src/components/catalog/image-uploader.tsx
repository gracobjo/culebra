"use client";

import { useRef, useState } from "react";
import Image from "next/image";

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
  const [preview, setPreview] = useState<string>(currentUrl || "");
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

    // Preview local inmediato
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

  return (
    <div className="space-y-3">
      {/* Hidden input que envía el Server Action */}
      <input type="hidden" name={inputName} value={preview} />

      {/* Preview */}
      <div
        className={`relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl border-2 ${
          isPlaceholder ? "border-dashed border-stone-300" : "border-stone-200"
        } bg-stone-100`}
      >
        <Image
          src={displaySrc}
          alt="Imagen del producto"
          fill
          sizes="(max-width: 640px) 100vw, 384px"
          className={`object-cover ${isPlaceholder ? "opacity-50" : ""}`}
        />
        {isPlaceholder && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-stone-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Sin foto propia · usando imagen de categoría</span>
          </div>
        )}

        {/* Botón quitar imagen actual */}
        {!isPlaceholder && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1 shadow hover:bg-red-50"
            title="Eliminar imagen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="text-sm text-stone-600">Subiendo...</span>
          </div>
        )}
      </div>

      {/* Botón seleccionar */}
      {!disabled && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
          >
            {uploading ? "Subiendo..." : preview ? "Cambiar foto" : "Subir foto del producto"}
          </button>
          <span className="text-xs text-stone-500">JPG, PNG o WebP · máx. 5 MB</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
