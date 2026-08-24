import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSiteSocialLinks } from "@culebra/auth";
import { SiteSocialLinksForm } from "./forms";

export const metadata = { title: "Configuración | Admin" };

export default async function AdminConfigPage() {
  await requireAdmin();
  const initialValues = await getSiteSocialLinks();

  return (
    <AdminShell title="Configuración">
      <div className="space-y-6">
        <SiteSocialLinksForm initialValues={initialValues} />
      </div>
    </AdminShell>
  );
}

