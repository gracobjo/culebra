import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getVendorContractStatus, type ContractVersionRecord } from "@culebra/auth";
import { PageShell } from "@/components/layout/page-shell";
import { AcceptContractButton } from "@/components/vendor/accept-contract-button";

export const metadata = {
  title: "Contratos | Panel productor",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_SIGNATURE: "Pendiente de firma",
  ACTIVE: "Activo",
  EXPIRING_SOON: "Proximo a vencer",
  EXPIRED: "Expirado",
  CANCELLED: "Cancelado",
};

function formatDate(value: Date | null) {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(value);
}

export default async function VendorContractsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/contratos");
  }

  let contractStatus;
  try {
    contractStatus = await getVendorContractStatus(session.user.id);
  } catch {
    redirect("/quiero-vender");
  }

  const { pendingVersion, activeVersion, contract } = contractStatus;

  return (
    <PageShell width="lg">
      <Link href="/panel/proveedor" className="text-sm text-emerald-800">
        ← Volver al perfil
      </Link>
      <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">Contratos</h1>
      <p className="mt-3 text-stone-600">
        Versiones del acuerdo con la plataforma. Cada cambio genera una nueva
        version sin borrar el historico.
      </p>

      {pendingVersion ? (
        <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-amber-900">
            Pendiente de tu aceptacion
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Version {pendingVersion.versionNumber}
          </h2>
          {pendingVersion.commissionPercent ? (
            <p className="mt-2 text-sm text-stone-700">
              Comision indicada: {pendingVersion.commissionPercent}%
            </p>
          ) : null}
          <p className="mt-2 text-sm text-stone-600">
            Vigencia: {formatDate(pendingVersion.startDate)} —{" "}
            {formatDate(pendingVersion.endDate)}
          </p>
          <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-amber-100 bg-white p-4 text-sm whitespace-pre-wrap text-stone-700">
            {pendingVersion.conditions}
          </div>
          <p className="mt-3 text-xs text-stone-500">
            Texto placeholder: [REVISAR CON ABOGADO]. Al aceptar queda registrada
            tu IP y un hash del documento.
          </p>
          <div className="mt-6">
            <AcceptContractButton versionId={pendingVersion.id} />
          </div>
        </section>
      ) : null}

      {activeVersion ? (
        <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-900">
            Contrato activo
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Version {activeVersion.versionNumber}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Estado: {statusLabels[activeVersion.status] ?? activeVersion.status}
          </p>
          {activeVersion.acceptances[0] ? (
            <p className="mt-2 text-sm text-stone-600">
              Aceptado el{" "}
              {formatDate(activeVersion.acceptances[0].acceptedAt)}
            </p>
          ) : null}
        </section>
      ) : !pendingVersion ? (
        <p className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
          Aun no tienes un contrato activo. La plataforma te enviara una version
          para revisar y aceptar antes de publicar productos.
        </p>
      ) : null}

      {contract && contract.versions.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Historial de versiones</h2>
          <ul className="mt-4 space-y-3">
            {contract.versions.map((version: ContractVersionRecord) => (
              <li
                key={version.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-100 px-4 py-3 text-sm"
              >
                <span className="font-medium">v{version.versionNumber}</span>
                <span className="text-stone-600">
                  {statusLabels[version.status] ?? version.status}
                </span>
                <span className="text-stone-500">{formatDate(version.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}
