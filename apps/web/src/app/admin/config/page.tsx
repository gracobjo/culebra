import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getShippingSettings,
  getSiteSocialLinks,
  listHomeHubTilesForAdmin,
} from "@culebra/auth";
import { ShippingSettingsForm, SiteSocialLinksForm } from "./forms";
import { HomeHubTilesCrud } from "./hub-tiles-form";
import { WcagAuditPanel } from "./wcag-audit-panel";

export const metadata = { title: "Configuración | Admin" };

export default async function AdminConfigPage() {
  await requireAdmin();
  const [initialValues, shippingSettings, hubTiles] = await Promise.all([
    getSiteSocialLinks(),
    getShippingSettings(),
    listHomeHubTilesForAdmin(),
  ]);

  return (
    <AdminShell title="Configuración">
      <div className="space-y-6">
        <ShippingSettingsForm initialValues={shippingSettings} />
        <SiteSocialLinksForm initialValues={initialValues} />
        <HomeHubTilesCrud tiles={hubTiles} />
        <WcagAuditPanel />
      </div>
    </AdminShell>
  );
}
