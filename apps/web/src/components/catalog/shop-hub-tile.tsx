import Link from "next/link";
import Image from "next/image";

export type ShopHubTileProps = {
  href: string;
  title: string;
  description: string;
  imageSrc?: string;
  eyebrow?: string;
  externalHint?: boolean;
};

export function ShopHubTile({
  href,
  title,
  description,
  imageSrc,
  eyebrow,
  externalHint,
}: ShopHubTileProps) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-stone-200">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-stone-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-stone-950/10 to-transparent" />
        {eyebrow ? (
          <p className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-emerald-900">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="absolute bottom-3 left-4 right-4 text-lg font-semibold leading-snug text-white drop-shadow-sm">
          {title}
        </h2>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="flex-1 text-sm text-stone-600">{description}</p>
        {externalHint ? (
          <p className="mt-3 text-xs text-stone-500">
            Reserva fuera del marketplace · sin checkout aquí
          </p>
        ) : (
          <p className="mt-3 text-xs font-medium text-emerald-800 opacity-0 transition group-hover:opacity-100">
            Ver productos →
          </p>
        )}
      </div>
    </Link>
  );
}
