import Link from "next/link";
import {
  getAffiliateLoyaltyMetrics,
  getAffiliateProgramSummary,
  listAffiliateCodesForAdmin,
  listAffiliateCommissionsForAdmin,
} from "@culebra/auth";
import { prisma } from "@culebra/db";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { AffiliateProgramDashboard } from "@/components/admin/affiliate-program-dashboard";

export const metadata = { title: "Programa de afiliados | Admin" };

export default async function AdminAffiliatesPage() {
  await requireAdmin("/admin/afiliados");

  const [summary, loyalty, affiliates, commissions, accommodations, vendors] = await Promise.all([
    getAffiliateProgramSummary(),
    getAffiliateLoyaltyMetrics(),
    listAffiliateCodesForAdmin(),
    listAffiliateCommissionsForAdmin({ limit: 80 }),
    prisma.accommodation.findMany({
      where: { status: { not: "DISABLED" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.vendor.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      select: { id: true, tradeName: true },
      orderBy: { tradeName: "asc" },
    }),
  ]);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  return (
    <AdminShell title="Programa de afiliados">
      <p className="max-w-3xl text-sm text-stone-600">
        Comisiones 8–10 % sobre PVP productos (sin portes), pago solo por venta confirmada.
        Arranque con códigos únicos + ledger interno. Guías:{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">
          docs/Programa_Afiliados_Sabores_Culebra.md
        </code>
        {" · "}
        <code className="rounded bg-stone-100 px-1 text-xs">
          docs/Programa_Fidelizacion_Afiliados.md
        </code>
        {" · "}
        <Link href="/admin/turismo" className="text-emerald-800 underline">
          Turismo / alojamientos
        </Link>
        .
      </p>

      <div className="mt-8">
        <AffiliateProgramDashboard
          summary={summary}
          loyalty={loyalty}
          affiliates={affiliates}
          commissions={commissions}
          accommodations={accommodations}
          vendors={vendors}
          appUrl={appUrl}
        />
      </div>
    </AdminShell>
  );
}
