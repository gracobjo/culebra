import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSiteSocialLinks, listHomeHubTilesForAdmin } from "@culebra/auth";
import { SiteSocialLinksForm } from "./forms";
import { HomeHubTilesCrud } from "./hub-tiles-form";
import { WcagAuditPanel } from "./wcag-audit-panel";

export const metadata = { title: "Configuración | Admin" };

export default async function AdminConfigPage() {
  await requireAdmin();
  const [initialValues, hubTiles] = await Promise.all([
    getSiteSocialLinks(),
    listHomeHubTilesForAdmin(),
  ]);

  return (
    <AdminShell title="Configuración">
      <div className="space-y-6">
        <SiteSocialLinksForm initialValues={initialValues} />
        <HomeHubTilesCrud tiles={hubTiles} />
        <WcagAuditPanel />
      </div>
    </AdminShell>
  );
}

