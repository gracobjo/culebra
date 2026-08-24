import Link from "next/link";
import {
  getLodgingOfferContacts,
  listAccommodationsForAdmin,
  listAffiliateCodesForAdmin,
  listCouponsForAdmin,
  listLodgingRelationsForAdmin,
  listPublicProducts,
  listTourismPacksForAdmin,
  summarizeLodgingCrm,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { AlojamientosEstrategia } from "@/components/admin/alojamientos-estrategia";
import { LodgingCompensationPlaybook } from "@/components/admin/lodging-compensation-playbook";
import { LodgingCrmBoard } from "@/components/admin/lodging-crm-board";
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
  const [accommodations, packs, coupons, affiliates, productsResult, relations, offerContacts] =
    await Promise.all([
      listAccommodationsForAdmin(),
      listTourismPacksForAdmin(),
      listCouponsForAdmin(),
      listAffiliateCodesForAdmin(),
      listPublicProducts({ limit: 60 }),
      listLodgingRelationsForAdmin(),
      getLodgingOfferContacts(),
    ]);
  const crmSummary = summarizeLodgingCrm(relations);

  const products = productsResult.items.map((item) => ({ id: item.id, name: item.name }));
  const accommodationOptions = accommodations.map((item) => ({ id: item.id, name: item.name }));
  const couponOptions = coupons.map((item) => ({ id: item.id, code: item.code }));

  return (
    <AdminShell title="Turismo — alojamientos como canal">
      <p className="max-w-3xl text-sm text-stone-600">
        Estrategia de captación, contraprestaciones justas y CRM de relaciones con hosteleros.
        Playbook:{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">
          docs/Estrategia_Alojamientos_Rurales.md
        </code>
        {" · "}
        <code className="rounded bg-stone-100 px-1 text-xs">
          docs/Relaciones_Hosteleros_Contraprestaciones.md
        </code>
        {" · "}
        <Link href="/admin/showroom" className="text-emerald-800 underline">
          Showroom
        </Link>
        .
      </p>

      <div className="mt-8">
        <LodgingCrmBoard
          relations={relations}
          summary={crmSummary}
          accommodations={accommodationOptions}
          contacts={offerContacts}
        />
      </div>

      <div className="mt-10">
        <LodgingCompensationPlaybook />
      </div>

      <div className="mt-10">
        <AlojamientosEstrategia />
      </div>

      <h2 className="mt-12 text-lg font-semibold text-stone-900">Operativa del directorio</h2>
      <p className="mt-1 max-w-3xl text-sm text-stone-500">
        Alta y publicación de alojamientos, packs y códigos (fases 2–3 del producto turismo).
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
