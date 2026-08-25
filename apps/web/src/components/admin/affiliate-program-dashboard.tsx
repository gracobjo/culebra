"use client";

import { useActionState, useMemo, useState } from "react";
import type {
  AffiliateCodeRecord,
  AffiliateCommissionRecord,
  AffiliateProgramSummary,
} from "@culebra/auth";
import {
  AFFILIATE_STATUS_LABELS,
  AFFILIATE_TYPE_LABELS,
  COMMISSION_STATUS_LABELS,
  COMMISSION_TYPE_LABELS,
  DEFAULT_COMMISSION_BY_TYPE,
} from "@culebra/auth/affiliate.constants";
import {
  cancelCommissionAction,
  createAffiliateProgramAction,
  markPayoutAction,
  registerShowroomCommissionAction,
  type AffiliateAdminState,
} from "@/app/admin/afiliados/actions";
import { CommissionStackCalculator } from "@/components/admin/commission-stack-calculator";

const initial: AffiliateAdminState = {};

function money(value: number) {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-stone-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}

export function AffiliateProgramDashboard({
  summary,
  affiliates,
  commissions,
  accommodations,
  vendors,
  appUrl,
}: {
  summary: AffiliateProgramSummary;
  affiliates: AffiliateCodeRecord[];
  commissions: AffiliateCommissionRecord[];
  accommodations: Array<{ id: string; name: string }>;
  vendors: Array<{ id: string; tradeName: string }>;
  appUrl: string;
}) {
  const [createState, createAction, createPending] = useActionState(
    createAffiliateProgramAction,
    initial,
  );
  const [showroomState, showroomAction, showroomPending] = useActionState(
    registerShowroomCommissionAction,
    initial,
  );
  const [selectedAffiliateId, setSelectedAffiliateId] = useState(
    affiliates.find((a) => a.commissionPending >= a.payoutMinimum)?.id ?? "",
  );
  const [affiliateType, setAffiliateType] =
    useState<keyof typeof DEFAULT_COMMISSION_BY_TYPE>("LODGING");

  const defaultPct = DEFAULT_COMMISSION_BY_TYPE[affiliateType];

  const pendingByAffiliate = useMemo(() => {
    const map = new Map<string, AffiliateCommissionRecord[]>();
    for (const row of commissions) {
      if (row.status !== "PENDING" && row.status !== "APPROVED") continue;
      const list = map.get(row.affiliateId) ?? [];
      list.push(row);
      map.set(row.affiliateId, list);
    }
    return map;
  }, [commissions]);

  const payoutRows = selectedAffiliateId
    ? (pendingByAffiliate.get(selectedAffiliateId) ?? [])
    : [];

  const payoutTotal = payoutRows.reduce((sum, row) => sum + row.commissionAmount, 0);
  const selectedAffiliate = affiliates.find((a) => a.id === selectedAffiliateId);

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Afiliados activos"
          value={String(summary.activeAffiliates)}
          hint="Piloto: 5–8 al inicio"
        />
        <KpiCard
          label="Comisiones pendientes"
          value={money(summary.pendingAmount)}
          hint={`${summary.pendingCommissions} líneas por pagar`}
        />
        <KpiCard
          label="Pagado este año"
          value={money(summary.paidThisYear)}
        />
        <KpiCard
          label="Pedidos atribuidos"
          value={String(summary.ordersAttributed)}
          hint="Solo ventas online confirmadas"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <form
          action={createAction}
          className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5"
        >
          <h2 className="text-lg font-semibold">Nuevo afiliado</h2>
          <p className="text-sm text-stone-600">
            Código único (ej. ALOJ-MONTAÑA). Enlace:{" "}
            <code className="rounded bg-stone-100 px-1 text-xs">{appUrl}/productos?ref=CODIGO</code>
          </p>
          <input
            name="code"
            required
            placeholder="Código (ALOJ-MONTAÑA)"
            className="min-h-11 w-full rounded-xl border px-3 uppercase"
          />
          <input
            name="label"
            required
            placeholder="Nombre / etiqueta"
            className="min-h-11 w-full rounded-xl border px-3"
          />
          <select
            name="affiliateType"
            value={affiliateType}
            onChange={(e) =>
              setAffiliateType(e.target.value as keyof typeof DEFAULT_COMMISSION_BY_TYPE)
            }
            className="min-h-11 w-full rounded-xl border px-3"
          >
            {Object.entries(AFFILIATE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-stone-600">
              Comisión % (máx. 10)
              <input
                name="commissionPct"
                type="number"
                min={0}
                max={10}
                step={0.5}
                defaultValue={defaultPct}
                key={affiliateType}
                className="mt-1 min-h-11 w-full rounded-xl border px-3"
              />
            </label>
            <label className="text-sm text-stone-600">
              Cookie (días)
              <input
                name="cookieDays"
                type="number"
                min={15}
                max={30}
                defaultValue={30}
                className="mt-1 min-h-11 w-full rounded-xl border px-3"
              />
            </label>
          </div>
          <select name="accommodationId" className="min-h-11 w-full rounded-xl border px-3" defaultValue="">
            <option value="">Sin alojamiento vinculado</option>
            {accommodations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select name="vendorId" className="min-h-11 w-full rounded-xl border px-3" defaultValue="">
            <option value="">Sin productor (no excluir ventas propias)</option>
            {vendors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.tradeName}
              </option>
            ))}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="contactEmail"
              type="email"
              placeholder="Email contacto"
              className="min-h-11 w-full rounded-xl border px-3"
            />
            <input
              name="contactPhone"
              placeholder="Teléfono / WhatsApp"
              className="min-h-11 w-full rounded-xl border px-3"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-stone-600">
              Mínimo pago (€)
              <input
                name="payoutMinimum"
                type="number"
                min={0}
                defaultValue={30}
                className="mt-1 min-h-11 w-full rounded-xl border px-3"
              />
            </label>
            <select name="programStatus" className="min-h-11 w-full rounded-xl border px-3" defaultValue="ACTIVE">
              {Object.entries(AFFILIATE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="notes"
            rows={2}
            placeholder="Notas internas"
            className="w-full rounded-xl border px-3 py-2"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked />
            Activo
          </label>
          <button
            type="submit"
            disabled={createPending}
            className="min-h-11 rounded-full bg-emerald-800 px-5 text-sm text-white disabled:opacity-60"
          >
            {createPending ? "Guardando..." : "Crear afiliado"}
          </button>
          {createState.error ? <p className="text-sm text-red-700">{createState.error}</p> : null}
          {createState.success ? (
            <p className="text-sm text-emerald-800">{createState.success}</p>
          ) : null}
        </form>

        <div className="space-y-6">
          <form
            action={showroomAction}
            className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50/40 p-5"
          >
            <h2 className="text-lg font-semibold">Venta showroom atribuida</h2>
            <p className="text-sm text-stone-600">
              Registro manual cuando la compra en tienda se identifica con el código del afiliado
              (5–8 % recomendado).
            </p>
            <select name="affiliateId" required className="min-h-11 w-full rounded-xl border px-3">
              <option value="" disabled>
                Afiliado
              </option>
              {affiliates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} — {item.label}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="baseAmount"
                type="number"
                min={0.01}
                step={0.01}
                required
                placeholder="Base PVP productos (€)"
                className="min-h-11 w-full rounded-xl border px-3"
              />
              <input
                name="commissionPct"
                type="number"
                min={0}
                max={10}
                step={0.5}
                placeholder="% (opcional, usa el del afiliado)"
                className="min-h-11 w-full rounded-xl border px-3"
              />
            </div>
            <input
              name="notes"
              placeholder="Notas (ticket, fecha visita...)"
              className="min-h-11 w-full rounded-xl border px-3"
            />
            <button
              type="submit"
              disabled={showroomPending}
              className="min-h-11 rounded-full bg-amber-800 px-5 text-sm text-white disabled:opacity-60"
            >
              {showroomPending ? "Registrando..." : "Registrar comisión showroom"}
            </button>
            {showroomState.error ? (
              <p className="text-sm text-red-700">{showroomState.error}</p>
            ) : null}
            {showroomState.success ? (
              <p className="text-sm text-emerald-800">{showroomState.success}</p>
            ) : null}
          </form>

          <section className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Materiales de captación</h2>
            <p className="mt-2 text-sm text-stone-600">
              Mensaje tipo WhatsApp para alojamientos y productores:
            </p>
            <blockquote className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
              Hola, estamos lanzando un programa de afiliados de Sabores de la Culebra. Si
              recomiendas nuestros productos o cestas y se produce una venta con tu código, te llevas
              un 10 % de comisión. Es sencillo, sin permanencia y compatible con tu actividad. ¿Te
              envío las condiciones?
            </blockquote>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-stone-600">
              <li>Código o enlace personalizado por afiliado</li>
              <li>Pack imágenes: carpeta de marketing / cestas del catálogo</li>
              <li>Condiciones resumidas: ver documento del programa</li>
              <li>Soporte: contacto directo del equipo</li>
            </ul>
          </section>
        </div>
      </section>

      <CommissionStackCalculator />

      <section className="rounded-3xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Afiliados ({affiliates.length})</h2>
          <a
            href="/api/admin/affiliates/export"
            className="rounded-full border border-stone-300 px-4 py-2 text-sm hover:border-emerald-700"
          >
            Exportar comisiones CSV
          </a>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-stone-500">
              <tr>
                <th className="py-2 pr-4">Código</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">%</th>
                <th className="py-2 pr-4">Clicks</th>
                <th className="py-2 pr-4">Pedidos</th>
                <th className="py-2 pr-4">Pendiente</th>
                <th className="py-2 pr-4">Pagado</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((row) => (
                <tr key={row.id} className="border-b border-stone-100">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{row.code}</p>
                    <p className="text-xs text-stone-500">{row.label}</p>
                    <p className="mt-1 text-xs text-emerald-800">
                      {appUrl}/productos?ref={row.code}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    {AFFILIATE_TYPE_LABELS[row.affiliateType as keyof typeof AFFILIATE_TYPE_LABELS] ??
                      row.affiliateType}
                  </td>
                  <td className="py-3 pr-4">{row.commissionPct} %</td>
                  <td className="py-3 pr-4">{row.clickCount}</td>
                  <td className="py-3 pr-4">{row.orderCount}</td>
                  <td className="py-3 pr-4">{money(row.commissionPending)}</td>
                  <td className="py-3 pr-4">{money(row.commissionPaid)}</td>
                  <td className="py-3">
                    {row.isActive && row.programStatus === "ACTIVE" ? "Activo" : row.programStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Ledger de comisiones</h2>
            <p className="text-sm text-stone-600">
              Se generan al confirmar el pago del pedido online. No incluyen portes ni ventas
              propias del productor afiliado.
            </p>
          </div>
          <form action={markPayoutAction} className="flex flex-wrap items-end gap-2">
            <label className="text-sm text-stone-600">
              Marcar pago
              <select
                name="affiliateId"
                value={selectedAffiliateId}
                onChange={(e) => setSelectedAffiliateId(e.target.value)}
                className="mt-1 block min-h-11 rounded-xl border px-3"
              >
                <option value="">Afiliado con pendientes</option>
                {affiliates
                  .filter((a) => (pendingByAffiliate.get(a.id)?.length ?? 0) > 0)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} ({money(a.commissionPending)})
                    </option>
                  ))}
              </select>
            </label>
            <input type="hidden" name="commissionIds" value={payoutRows.map((r) => r.id).join(",")} />
            <input
              name="payoutNote"
              placeholder="Nota pago (transferencia...)"
              className="min-h-11 rounded-xl border px-3"
            />
            <button
              type="submit"
              disabled={!selectedAffiliateId || payoutRows.length === 0}
              className="min-h-11 rounded-full bg-emerald-800 px-5 text-sm text-white disabled:opacity-60"
            >
              Pagar {payoutRows.length} ({money(payoutTotal)})
            </button>
          </form>
        </div>
        {selectedAffiliate && payoutTotal < selectedAffiliate.payoutMinimum ? (
          <p className="mt-2 text-xs text-amber-800">
            Aviso: {money(payoutTotal)} está por debajo del mínimo de pago (
            {money(selectedAffiliate.payoutMinimum)}).
          </p>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-stone-500">
              <tr>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Afiliado</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Pedido</th>
                <th className="py-2 pr-4">Base</th>
                <th className="py-2 pr-4">Comisión</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((row) => (
                <tr key={row.id} className="border-b border-stone-100">
                  <td className="py-3 pr-4">{row.eventDate}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{row.affiliateCode}</p>
                    <p className="text-xs text-stone-500">{row.affiliateLabel}</p>
                  </td>
                  <td className="py-3 pr-4">
                    {COMMISSION_TYPE_LABELS[row.commissionType as keyof typeof COMMISSION_TYPE_LABELS] ??
                      row.commissionType}
                  </td>
                  <td className="py-3 pr-4">{row.orderNumber ?? "—"}</td>
                  <td className="py-3 pr-4">{money(row.baseAmount)}</td>
                  <td className="py-3 pr-4">
                    {money(row.commissionAmount)} ({row.commissionPct} %)
                  </td>
                  <td className="py-3 pr-4">
                    {COMMISSION_STATUS_LABELS[row.status as keyof typeof COMMISSION_STATUS_LABELS] ??
                      row.status}
                  </td>
                  <td className="py-3">
                    {row.status === "PENDING" || row.status === "APPROVED" ? (
                      <form action={cancelCommissionAction}>
                        <input type="hidden" name="commissionId" value={row.id} />
                        <button type="submit" className="text-xs text-red-700 underline">
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
