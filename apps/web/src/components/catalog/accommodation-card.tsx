import Link from "next/link";
import type { AccommodationRecord } from "@culebra/auth";

const KIND_LABELS: Record<string, string> = {
  CASA_RURAL: "Casa rural",
  HOSTAL: "Hostal",
  HOTEL: "Hotel",
  APARTAMENTO: "Apartamento",
};

export function AccommodationCard({
  accommodation,
}: {
  accommodation: AccommodationRecord;
}) {
  const location = [accommodation.city, accommodation.municipality, accommodation.province]
    .filter(Boolean)
    .join(", ");
  const kind = KIND_LABELS[accommodation.kind] ?? accommodation.kind;

  return (
    <Link
      href={`/alojamientos/${accommodation.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex aspect-[16/10] items-center justify-center bg-stone-100 text-stone-500">
        {accommodation.imageUrl ? (
          <img
            src={accommodation.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm">{kind}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-[0.15em] text-emerald-800">{kind}</p>
        <h2 className="mt-1 text-xl font-semibold group-hover:text-emerald-900">
          {accommodation.name}
        </h2>
        {location ? <p className="mt-1 text-sm text-stone-500">{location}</p> : null}
        {accommodation.shortDescription ? (
          <p className="mt-3 line-clamp-3 text-sm text-stone-600">
            {accommodation.shortDescription}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
