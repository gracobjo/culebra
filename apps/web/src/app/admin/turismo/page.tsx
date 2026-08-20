import {
  listAccommodationsForAdmin,
  listAffiliateCodesForAdmin,
  listCouponsForAdmin,
  listPublicProducts,
  listTourismPacksForAdmin,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { publishAccommodationAction } from "./actions";
import {
  CreateAccommodationForm,
  CreateAffiliateForm,
  CreateCouponForm,
  CreatePackForm,
} from "./forms";

export const metadata = { title: "Turismo | Admin" };

export default async function AdminTourismPage() {
  await requireAdmin();
  const [accommodations, packs, coupons, affiliates, productsResult] = await Promise.all([
    listAccommodationsForAdmin(),
    listTourismPacksForAdmin(),
    listCouponsForAdmin(),
    listAffiliateCodesForAdmin(),
    listPublicProducts({ limit: 60 }),
  ]);

  const products = productsResult.items.map((item) => ({ id: item.id, name: item.name }));
  const accommodationOptions = accommodations.map((item) => ({ id: item.id, name: item.name }));
  const couponOptions = coupons.map((item) => ({ id: item.id, code: item.code }));

  return (
    <AdminShell title="Turismo (fases 2–3)">
      <p className="max-w-3xl text-stone-600">
        Directorio de alojamientos (reserva externa), packs noche+lote, cupones y afiliacion.
        El nucleo agroalimentario sigue siendo el checkout principal.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <CreateAccommodationForm productOptions={products} />
        <CreateCouponForm />
        <CreatePackForm
          accommodations={accommodationOptions}
          coupons={couponOptions}
          products={products}
        />
        <CreateAffiliateForm accommodations={accommodationOptions} />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Alojamientos</h2>
        <ul className="mt-4 space-y-3">
          {accommodations.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-stone-500">
                  {item.slug} · {item.status} · {item.city ?? "—"}
                </p>
              </div>
              <form action={publishAccommodationAction} className="flex gap-2">
                <input type="hidden" name="id" value={item.id} />
                {item.status !== "PUBLISHED" ? (
                  <button
                    name="status"
                    value="PUBLISHED"
                    className="rounded-full border px-3 py-1 text-sm"
                  >
                    Publicar
                  </button>
                ) : (
                  <button
                    name="status"
                    value="DISABLED"
                    className="rounded-full border px-3 py-1 text-sm"
                  >
                    Desactivar
                  </button>
                )}
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Packs</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {packs.map((pack) => (
            <li key={pack.id} className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <span className="font-medium">{pack.name}</span> · {pack.status} ·{" "}
              {pack.accommodationName ?? "sin alojamiento"} · {pack.itemCount} productos
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Cupones</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {coupons.map((coupon) => (
            <li key={coupon.id} className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <span className="font-medium">{coupon.code}</span> · {coupon.name} ·{" "}
              {coupon.discountType} {coupon.discountValue} · usos {coupon.redemptionCount}
              {coupon.maxRedemptions != null ? `/${coupon.maxRedemptions}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Afiliados</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {affiliates.map((item) => (
            <li key={item.id} className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <span className="font-medium">{item.code}</span> · {item.label} · pedidos{" "}
              {item.orderCount}
              {item.accommodationName ? ` · ${item.accommodationName}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
