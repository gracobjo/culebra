"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

export type ValuePropositionFields = {
  headline: string;
  context: string;
  benefits: string;
  offerTerms: string;
  productMix: string;
  nextSteps: string;
  internalNotes: string;
  preparedBy: string;
  status: "DRAFT" | "READY";
};

type ValuePropositionFormProps = {
  pilotProducerId: string;
  producerLabel: string;
  initial: ValuePropositionFields;
  action: (formData: FormData) => Promise<void>;
};

function SubmitButtons() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="submit"
        name="markReady"
        value="0"
        disabled={pending}
        className="btn btn-secondary"
      >
        {pending ? "Guardando…" : "Guardar borrador"}
      </button>
      <button
        type="submit"
        name="markReady"
        value="1"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? "Guardando…" : "Marcar lista (completa la tarea)"}
      </button>
    </div>
  );
}

export function ValuePropositionForm({
  pilotProducerId,
  producerLabel,
  initial,
  action,
}: ValuePropositionFormProps) {
  return (
    <form action={action} className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6">
      <input type="hidden" name="pilotProducerId" value={pilotProducerId} />
      <input type="hidden" name="status" value={initial.status} />

      <p className="text-sm text-stone-500">{producerLabel}</p>

      <Field
        name="headline"
        label="Titular"
        defaultValue={initial.headline}
        hint="Frase de apertura de la ficha"
      />
      <TextArea
        name="context"
        label="Contexto"
        defaultValue={initial.context}
        rows={5}
        hint="Quién es el productor y por qué encaja en el piloto"
      />
      <TextArea
        name="benefits"
        label="Beneficios (una línea por beneficio)"
        defaultValue={initial.benefits}
        rows={7}
      />
      <TextArea
        name="offerTerms"
        label="Condiciones de la oferta fundadores"
        defaultValue={initial.offerTerms}
        rows={6}
      />
      <TextArea
        name="productMix"
        label="Surtido / productos sugeridos"
        defaultValue={initial.productMix}
        rows={4}
      />
      <TextArea
        name="nextSteps"
        label="Próximos pasos"
        defaultValue={initial.nextSteps}
        rows={5}
      />
      <TextArea
        name="internalNotes"
        label="Notas internas (no van a la versión imprimible)"
        defaultValue={initial.internalNotes}
        rows={3}
      />
      <Field
        name="preparedBy"
        label="Preparado por"
        defaultValue={initial.preparedBy}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
        <SubmitButtons />
        <Link
          href={`/admin/piloto/${pilotProducerId}/propuesta?print=1`}
          target="_blank"
          className="text-sm font-medium text-emerald-800 underline"
        >
          Abrir versión imprimible / PDF
        </Link>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  defaultValue: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
    </div>
  );
}

function TextArea({
  name,
  label,
  defaultValue,
  rows,
  hint,
}: {
  name: string;
  label: string;
  defaultValue: string;
  rows: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
    </div>
  );
}
