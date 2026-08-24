import {
  getLodgingOfferContacts,
  getLodgingRelationById,
  listAccommodationsForAdmin,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { LodgingRelationDetail } from "@/components/admin/lodging-relation-detail";
import { notFound } from "next/navigation";

export const metadata = { title: "Relación hostelero | Admin" };

export default async function LodgingRelationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [relation, contacts, accommodations] = await Promise.all([
    getLodgingRelationById(id),
    getLodgingOfferContacts(),
    listAccommodationsForAdmin(),
  ]);
  if (!relation) notFound();

  return (
    <AdminShell title={`Relación · ${relation.name}`}>
      <LodgingRelationDetail
        relation={relation}
        contacts={contacts}
        accommodations={accommodations.map((a) => ({ id: a.id, name: a.name }))}
      />
    </AdminShell>
  );
}
