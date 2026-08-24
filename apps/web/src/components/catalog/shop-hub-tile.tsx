import Image from "next/image";
import { HintedLink } from "@/components/ux/hinted-link";

export type ShopHubTileProps = {
  href: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  hint?: string;
  eyebrow?: string;
  externalHint?: boolean;
  tone?: "agro" | "territory";
};

export function ShopHubTile({
  href,
  title,
  description,
  imageSrc,
  imageAlt,
  hint,
  eyebrow,
  externalHint,
  tone = "agro",
}: ShopHubTileProps) {
  const isTerritory = tone === "territory";
  const actionHint =
    hint ??
    (externalHint
      ? `Abrir ${title}: reserva fuera del marketplace`
      : `Abrir ${title} y ver productos`);
  const alt = imageAlt?.trim() || `Imagen de la sección ${title}`;

  return (
    <HintedLink
      href={href}
      hint={actionHint}
      className={`shop-card group ${isTerritory ? "shop-card-territory" : ""}`}
    >
      <div className="relative aspect-[5/3.2] overflow-hidden rounded-t-[1.5rem] bg-stone-200">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--monte)] to-stone-800" />
        )}
        <div
          className={`absolute inset-0 ${
            isTerritory
              ? "bg-gradient-to-t from-[#1b4332]/70 via-[#1b4332]/20 to-transparent"
              : "bg-gradient-to-t from-[#0f241c]/75 via-[#0f241c]/15 to-transparent"
          }`}
        />
        {eyebrow ? (
          <p
            className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
              isTerritory
                ? "bg-[color-mix(in_srgb,var(--accent-gold)_18%,white)] text-[var(--monte)]"
                : "bg-white/92 text-[var(--monte)]"
            }`}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 className="absolute bottom-3.5 left-4 right-4 text-[1.05rem] font-semibold leading-snug tracking-tight text-white drop-shadow-sm sm:text-lg">
          {title}
        </h2>
      </div>
      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
        <p className="flex-1 text-sm leading-relaxed text-stone-600">{description}</p>
        {externalHint ? (
          <p className="mt-3 text-xs tracking-wide text-stone-500">
            Reserva fuera del marketplace · sin checkout aquí
          </p>
        ) : (
          <p className="mt-3 text-xs font-medium tracking-wide text-[var(--monte-mid)]">
            Ver productos →
          </p>
        )}
      </div>
    </HintedLink>
  );
}
