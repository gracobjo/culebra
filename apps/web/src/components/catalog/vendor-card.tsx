import Link from "next/link";
import type { PublicVendorRecord } from "@culebra/auth";

export function VendorCard({ vendor }: { vendor: PublicVendorRecord }) {
  const location = [vendor.city, vendor.province].filter(Boolean).join(", ");

  return (
    <Link
      href={`/productores/${vendor.slug}`}
      className="group flex flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {vendor.logoUrl ? (
          <img
            src={vendor.logoUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-2xl border border-stone-200 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-semibold text-emerald-900">
            {vendor.tradeName.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-xl font-semibold group-hover:text-emerald-900">
            {vendor.tradeName}
          </h2>
          {location ? <p className="mt-1 text-sm text-stone-500">{location}</p> : null}
        </div>
      </div>
      {vendor.description ? (
        <p className="mt-4 line-clamp-3 text-sm text-stone-600">{vendor.description}</p>
      ) : null}
      {vendor.productCount != null && vendor.productCount > 0 ? (
        <p className="mt-4 text-xs font-medium text-emerald-800">
          {vendor.productCount} producto{vendor.productCount === 1 ? "" : "s"}
        </p>
      ) : null}
    </Link>
  );
}
