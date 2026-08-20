import Link from "next/link";

export type ShopHubTileProps = {
  href: string;
  title: string;
  description: string;
  eyebrow?: string;
  externalHint?: boolean;
};

export function ShopHubTile({
  href,
  title,
  description,
  eyebrow,
  externalHint,
}: ShopHubTileProps) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`text-lg font-semibold leading-snug group-hover:text-emerald-900 ${eyebrow ? "mt-2" : ""}`}
      >
        {title}
      </h2>
      <p className="mt-2 flex-1 text-sm text-stone-600">{description}</p>
      {externalHint ? (
        <p className="mt-4 text-xs text-stone-500">
          Reserva fuera del marketplace · sin checkout aqui
        </p>
      ) : null}
    </Link>
  );
}
