import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@culebra/db";
import { savePilotValueProposition } from "../../actions";
import { defaultValueProposition } from "../../value-proposition-defaults";
import { ValuePropositionForm } from "./value-proposition-form";

export const metadata = { title: "Ficha propuesta de valor | Piloto" };

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; print?: string }>;
};

export default async function PilotValuePropositionPage({
  params,
  searchParams,
}: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;

  const producer = await prisma.pilotProducer.findUnique({
    where: { id },
    include: { valueProposition: true },
  });
  if (!producer) notFound();

  const defaults = defaultValueProposition({
    producerName: producer.producerName,
    category: producer.category,
    location: producer.location,
  });

  const sheet = producer.valueProposition;
  const initial = {
    headline: sheet?.headline ?? defaults.headline,
    context: sheet?.context ?? defaults.context,
    benefits: sheet?.benefits ?? defaults.benefits,
    offerTerms: sheet?.offerTerms ?? defaults.offerTerms,
    productMix: sheet?.productMix ?? defaults.productMix,
    nextSteps: sheet?.nextSteps ?? defaults.nextSteps,
    internalNotes: sheet?.internalNotes ?? "",
    preparedBy: sheet?.preparedBy ?? defaults.preparedBy,
    status: (sheet?.status === "READY" ? "READY" : "DRAFT") as "DRAFT" | "READY",
  };

  const printMode = query.print === "1";

  if (printMode) {
    return (
      <div className="mx-auto max-w-3xl bg-white px-8 py-10 text-stone-900 print:px-0 print:py-0">
        <header className="border-b border-stone-200 pb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-800">
            Sabores de la Culebra · Programa fundadores
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{initial.headline}</h1>
          <p className="mt-2 text-sm text-stone-600">
            {producer.producerName} · {producer.category}
            {producer.location ? ` · ${producer.location}` : ""}
          </p>
        </header>
        <PrintSection title="Contexto" body={initial.context} />
        <PrintSection title="Qué os aportamos" body={initial.benefits} list />
        <PrintSection title="Condiciones de la oferta" body={initial.offerTerms} list />
        <PrintSection title="Surtido sugerido" body={initial.productMix} list />
        <PrintSection title="Próximos pasos" body={initial.nextSteps} list />
        <footer className="mt-8 border-t border-stone-200 pt-4 text-xs text-stone-500">
          Preparado por: {initial.preparedBy || "—"}
          {sheet?.preparedAt
            ? ` · ${new Date(sheet.preparedAt).toLocaleDateString("es-ES")}`
            : ""}
          {" · "}Comisión fundadores 12 % el primer año (17 % estándar)
        </footer>
        <script
          dangerouslySetInnerHTML={{
            __html: "window.addEventListener('load',()=>window.print());",
          }}
        />
      </div>
    );
  }

  return (
    <AdminShell title={`Propuesta de valor — ${producer.producerName}`}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/piloto" className="text-sm text-emerald-800 underline">
          ← Volver al grupo piloto
        </Link>
        {query.saved ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900">
            Ficha guardada
          </span>
        ) : null}
        {initial.status === "READY" ? (
          <span className="rounded-full bg-emerald-800 px-3 py-1 text-xs font-medium text-white">
            Lista para visita
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
            Borrador
          </span>
        )}
      </div>

      <p className="mb-6 max-w-2xl text-sm text-stone-600">
        Documento comercial para la visita puerta a puerta (tarea Fase 1:
        «Preparar ficha de propuesta de valor»). Se rellena con datos del
        productor y la oferta fundadores; puedes editarlo y marcarlo como listo.
      </p>

      <ValuePropositionForm
        pilotProducerId={producer.id}
        producerLabel={`${producer.producerName} · ${producer.category}`}
        initial={initial}
        action={savePilotValueProposition}
      />
    </AdminShell>
  );
}

function PrintSection({
  title,
  body,
  list = false,
}: {
  title: string;
  body: string;
  list?: boolean;
}) {
  if (!body.trim()) return null;
  const lines = body
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">
        {title}
      </h2>
      {list ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          {lines.map((line) => (
            <li key={line}>{line.replace(/^[-•\d.)\s]+/, "")}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 space-y-3 text-sm leading-relaxed">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </section>
  );
}
