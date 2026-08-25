import Link from "next/link";
import {
  getShowroomLoyaltySummary,
  listClubMembersForAdmin,
  listRecentScratchPlays,
  listReferralsForAdmin,
  listStampCardsForAdmin,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { ShowroomLoyaltyDashboard } from "@/components/admin/showroom-loyalty-dashboard";

export const metadata = { title: "Fidelización showroom | Admin" };

export default async function AdminShowroomLoyaltyPage() {
  await requireAdmin("/admin/showroom/fidelizacion");

  const [summary, recentScratch, stampCards, clubMembers, referrals] = await Promise.all([
    getShowroomLoyaltySummary(),
    listRecentScratchPlays(15),
    listStampCardsForAdmin(25),
    listClubMembersForAdmin(20),
    listReferralsForAdmin(20),
  ]);

  return (
    <AdminShell title="Showroom — fidelización y premios">
      <p className="max-w-3xl text-sm text-stone-600">
        Rasca y gana, tarjeta de sellos, Club WhatsApp y trae a un amigo. Diseñado para gestionar en
        segundos desde móvil. Guía:{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">docs/Showroom_Fidelizacion_Premios.md</code>
        {" · "}
        <Link href="/admin/showroom/estadisticas" className="text-emerald-800 underline">
          Procedencia visitantes
        </Link>
        {" · "}
        <Link href="/admin/showroom" className="text-emerald-800 underline">
          Simulador showroom
        </Link>
        .
      </p>

      <div className="mt-8">
        <ShowroomLoyaltyDashboard
          summary={summary}
          recentScratch={recentScratch}
          stampCards={stampCards}
          clubMembers={clubMembers}
          referrals={referrals}
        />
      </div>
    </AdminShell>
  );
}
