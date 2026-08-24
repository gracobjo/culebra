import Link from "next/link";
import type { PublicTourismPackRecord } from "@culebra/auth";
import { formatPrice } from "@/lib/format";
import { PackCover } from "@/components/catalog/pack-cover";

export function TourismPackCard({ pack }: { pack: PublicTourismPackRecord }) {
  return (
    <Link
      href={`/packs/${pack.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
      <PackCover pack={pack} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-xl font-semibold group-hover:text-emerald-900">{pack.name}</h2>
        {pack.accommodation ? (
          <p className="mt-1 text-sm text-stone-500">
            Con {pack.accommodation.name}
            {pack.nightsHint ? ` · ${pack.nightsHint}` : ""}
          </p>
        ) : pack.nightsHint ? (
          <p className="mt-1 text-sm text-stone-500">{pack.nightsHint}</p>
        ) : null}
        {pack.shortDescription ? (
          <p className="mt-3 line-clamp-3 text-sm text-stone-600">{pack.shortDescription}</p>
        ) : null}
        <p className="mt-4 text-sm font-medium text-emerald-900">
          Lote desde {formatPrice(pack.packSubtotal)}
        </p>
      </div>
    </Link>
  );
}
