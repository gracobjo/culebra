"use client";

import { useActionState, useState } from "react";
import {
  SHOWROOM_FOOTFALL_TYPE_LABELS,
  SHOWROOM_FOOTFALL_TYPES,
  SHOWROOM_ORIGIN_GROUPS,
  SHOWROOM_ORIGIN_GROUP_LABELS,
} from "@culebra/auth/showroom-footfall.schemas";
import {
  SHOWROOM_CLUB_CHANNELS,
  SHOWROOM_CLUB_CHANNEL_LABELS,
  SHOWROOM_SCRATCH_PRIZE_META,
  SHOWROOM_STAMP_REWARDS,
} from "@culebra/auth/showroom-loyalty.schemas";
import type {
  ShowroomClubMemberRecord,
  ShowroomLoyaltySummary,
  ShowroomReferralRecord,
  ShowroomScratchPlayRecord,
  ShowroomStampCardRecord,
} from "@culebra/auth";
import {
  addStampAction,
  clubJoinAction,
  createStampCardAction,
  loyaltySettingsAction,
  markReferralRewardedAction,
  redeemStampAction,
  referralAction,
  scratchPlayAction,
  type LoyaltyAdminState,
} from "@/app/admin/showroom/fidelizacion/actions";

const initial: LoyaltyAdminState = {};

function Banner({ state }: { state: LoyaltyAdminState }) {
  if (state.error) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-800" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-900" role="status">
        {state.success}
      </p>
    );
  }
  return null;
}

function ScratchSection({ recent }: { recent: ShowroomScratchPlayRecord[] }) {
  const [state, action, pending] = useActionState(scratchPlayAction, initial);
  const [entryType, setEntryType] = useState<(typeof SHOWROOM_FOOTFALL_TYPES)[number] | "">("");

  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5">
      <h2 className="text-lg font-semibold text-amber-950">Rasca y gana</h2>
      <p className="mt-1 text-sm text-amber-950/80">
        Registra el resultado del rasca físico (kraft). ~1 de cada 5 gana; premios solo en producto
        o descuento.
      </p>
      <Banner state={state} />
      {state.scratchResult ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-6 text-center ${
            state.scratchResult.won
              ? "border-emerald-300 bg-emerald-100"
              : "border-stone-200 bg-white"
          }`}
        >
          <p className="text-2xl font-semibold">
            {state.scratchResult.won ? "¡Tiene premio!" : "Sin premio"}
          </p>
          {state.scratchResult.prizeLabel ? (
            <p className="mt-2 text-lg text-emerald-900">{state.scratchResult.prizeLabel}</p>
          ) : null}
        </div>
      ) : null}
      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="entryType" value={entryType} />
        <div className="flex flex-wrap gap-2">
          {SHOWROOM_FOOTFALL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setEntryType(t)}
              className={`min-h-11 rounded-full px-4 text-sm font-medium ${
                entryType === t
                  ? "bg-amber-800 text-white"
                  : "border border-amber-300 bg-white text-amber-950"
              }`}
            >
              {SHOWROOM_FOOTFALL_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <input
          name="customerLabel"
          placeholder="Nombre (opcional)"
          className="w-full max-w-xs rounded-xl border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!entryType || pending}
          className="min-h-11 rounded-full bg-amber-800 px-6 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Registrando…" : "Registrar rasca"}
        </button>
      </form>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-amber-900">Premios y límites</summary>
        <ul className="mt-2 space-y-1 text-xs text-stone-700">
          {Object.entries(SHOWROOM_SCRATCH_PRIZE_META).map(([k, m]) => (
            <li key={k}>
              {m.label} · máx. {m.maxPerMonth}/mes · peso {m.weight}
            </li>
          ))}
        </ul>
      </details>
      {recent.length > 0 ? (
        <ul className="mt-4 space-y-1 text-xs text-stone-600">
          {recent.slice(0, 5).map((p) => (
            <li key={p.id}>
              #{p.playNumber} · {p.won ? p.prizeLabel : "—"} · {p.entryType}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function StampSection({ cards }: { cards: ShowroomStampCardRecord[] }) {
  const [createState, createAction, createPending] = useActionState(createStampCardAction, initial);
  const [stampState, stampAction, stampPending] = useActionState(addStampAction, initial);
  const [redeemState, redeemAction, redeemPending] = useActionState(redeemStampAction, initial);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Tarjeta de sellos</h2>
      <p className="mt-1 text-sm text-stone-600">
        6 sellos → premio ({SHOWROOM_STAMP_REWARDS.join(" / ")}).
      </p>
      <Banner state={createState} />
      <Banner state={stampState} />
      <Banner state={redeemState} />
      <form action={createAction} className="mt-4 flex flex-wrap gap-2">
        <input
          name="customerName"
          required
          placeholder="Nombre cliente"
          className="min-h-11 flex-1 rounded-xl border px-3 text-sm"
        />
        <input
          name="contactHint"
          placeholder="Tel. / nota"
          className="min-h-11 w-32 rounded-xl border px-3 text-sm"
        />
        <button
          type="submit"
          disabled={createPending}
          className="min-h-11 rounded-full bg-emerald-800 px-4 text-sm font-medium text-white"
        >
          Nueva tarjeta
        </button>
      </form>
      <ul className="mt-4 space-y-2">
        {cards.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-100 px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium">{c.cardCode}</span> · {c.customerName} ·{" "}
              <span className="tabular-nums">
                {c.stampsCount}/{c.stampsRequired}
              </span>{" "}
              · {c.status}
            </div>
            <div className="flex gap-2">
              {c.status === "ACTIVE" ? (
                <form action={stampAction}>
                  <input type="hidden" name="cardId" value={c.id} />
                  <button
                    type="submit"
                    disabled={stampPending}
                    className="rounded-full border border-emerald-800 px-3 py-1 text-xs font-medium text-emerald-900"
                  >
                    + sello
                  </button>
                </form>
              ) : null}
              {c.status === "COMPLETED" ? (
                <form action={redeemAction}>
                  <input type="hidden" name="cardId" value={c.id} />
                  <button
                    type="submit"
                    disabled={redeemPending}
                    className="rounded-full bg-emerald-800 px-3 py-1 text-xs font-medium text-white"
                  >
                    Canjear
                  </button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ClubSection({ members }: { members: ShowroomClubMemberRecord[] }) {
  const [state, action, pending] = useActionState(clubJoinAction, initial);

  return (
    <section className="rounded-3xl border border-violet-200 bg-violet-50/40 p-5">
      <h2 className="text-lg font-semibold text-violet-950">Club de la Sierra (WhatsApp)</h2>
      <p className="mt-1 text-sm text-violet-950/80">
        Al captar contacto: avisos de lotes, ediciones limitadas y código exclusivo 1–2 veces/año.
      </p>
      <Banner state={state} />
      <form action={action} className="mt-4 grid gap-2 sm:grid-cols-2">
        <input name="name" required placeholder="Nombre" className="rounded-xl border px-3 py-2 text-sm" />
        <input name="contact" required placeholder="WhatsApp o email" className="rounded-xl border px-3 py-2 text-sm" />
        <select name="channel" className="rounded-xl border px-3 py-2 text-sm" defaultValue="WHATSAPP">
          {SHOWROOM_CLUB_CHANNELS.map((c) => (
            <option key={c} value={c}>
              {SHOWROOM_CLUB_CHANNEL_LABELS[c]}
            </option>
          ))}
        </select>
        <select name="originGroup" className="rounded-xl border px-3 py-2 text-sm" defaultValue="">
          <option value="">Procedencia (opcional)</option>
          {SHOWROOM_ORIGIN_GROUPS.map((g) => (
            <option key={g} value={g}>
              {SHOWROOM_ORIGIN_GROUP_LABELS[g]}
            </option>
          ))}
        </select>
        <input name="birthday" type="date" className="rounded-xl border px-3 py-2 text-sm" aria-label="Cumpleaños opcional" />
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full bg-violet-800 px-4 text-sm font-semibold text-white sm:col-span-2 sm:max-w-xs"
        >
          Alta en el club
        </button>
      </form>
      <ul className="mt-4 space-y-1 text-sm">
        {members.slice(0, 8).map((m) => (
          <li key={m.id} className="text-stone-700">
            {m.name} · {m.contact}
            {m.promoCode ? (
              <span className="ml-2 font-mono text-xs text-violet-800">{m.promoCode}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReferralSection({ referrals }: { referrals: ShowroomReferralRecord[] }) {
  const [state, action, pending] = useActionState(referralAction, initial);
  const [rewardState, rewardAction, rewardPending] = useActionState(markReferralRewardedAction, initial);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Trae a un amigo</h2>
      <p className="mt-1 text-sm text-stone-600">
        «Me ha traído [nombre]». Si compra, ambos reciben degustación o 10 % dto.
      </p>
      <Banner state={state} />
      <Banner state={rewardState} />
      <form action={action} className="mt-4 grid gap-2 sm:grid-cols-2">
        <input name="referrerName" required placeholder="Quién trae" className="rounded-xl border px-3 py-2 text-sm" />
        <input name="referredName" required placeholder="Amigo/a" className="rounded-xl border px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="referredPurchased" className="size-4 accent-emerald-800" />
          El amigo compró
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="rewardGiven" className="size-4 accent-emerald-800" />
          Premio ya entregado
        </label>
        <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-emerald-800 px-4 text-sm font-medium text-white sm:col-span-2 sm:max-w-xs">
          Registrar
        </button>
      </form>
      <ul className="mt-4 space-y-2 text-sm">
        {referrals.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
            <span>
              {r.referrerName} → {r.referredName}
              {r.referredPurchased ? " · compró" : ""}
              {r.rewardGiven ? " · premiado" : ""}
            </span>
            {r.referredPurchased && !r.rewardGiven ? (
              <form action={rewardAction}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" disabled={rewardPending} className="text-xs text-emerald-800 underline">
                  Marcar premio entregado
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function KpiBar({ summary }: { summary: ShowroomLoyaltySummary }) {
  const [state, action, pending] = useActionState(loyaltySettingsAction, initial);

  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5">
      <h2 className="text-lg font-semibold text-emerald-950">Control del mes ({summary.monthKey})</h2>
      <Banner state={state} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Rascas", v: `${summary.scratchWins}/${summary.scratchPlays}`, m: `${summary.scratchWinRatePct} % premio` },
          { l: "Sellos completas", v: String(summary.stampCardsCompleted), m: `${summary.stampCardsActive} activas` },
          { l: "Club", v: String(summary.clubJoinsThisMonth), m: `${summary.clubMembersActive} total` },
          { l: "Referidos", v: String(summary.referralsRewarded), m: `${summary.referralsPending} pendientes` },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-emerald-100 bg-white p-3">
            <p className="text-xs text-stone-500">{k.l}</p>
            <p className="text-xl font-semibold tabular-nums">{k.v}</p>
            <p className="text-xs text-stone-500">{k.m}</p>
          </div>
        ))}
      </div>
      {summary.prizesByType.length > 0 ? (
        <ul className="mt-4 text-sm text-stone-700">
          {summary.prizesByType.map((p) => (
            <li key={p.prize}>
              {p.label}: {p.count}
            </li>
          ))}
        </ul>
      ) : null}
      <form action={action} className="mt-4 flex flex-wrap items-end gap-2 text-sm">
        <input type="hidden" name="monthKey" value={summary.monthKey} />
        <label>
          1 premio cada N rascas
          <input name="scratchWinEveryN" type="number" min={2} max={20} defaultValue={5} className="ml-2 w-16 rounded border px-2 py-1" />
        </label>
        <label>
          Máx. premios/mes
          <input name="scratchMaxWins" type="number" min={1} max={200} defaultValue={40} className="ml-2 w-16 rounded border px-2 py-1" />
        </label>
        <button type="submit" disabled={pending} className="rounded-full border border-emerald-800 px-3 py-1.5 text-xs font-medium">
          Guardar reglas
        </button>
      </form>
    </section>
  );
}

export function ShowroomLoyaltyDashboard({
  summary,
  recentScratch,
  stampCards,
  clubMembers,
  referrals,
}: {
  summary: ShowroomLoyaltySummary;
  recentScratch: ShowroomScratchPlayRecord[];
  stampCards: ShowroomStampCardRecord[];
  clubMembers: ShowroomClubMemberRecord[];
  referrals: ShowroomReferralRecord[];
}) {
  return (
    <div className="space-y-8">
      <KpiBar summary={summary} />
      <ScratchSection recent={recentScratch} />
      <div className="grid gap-6 lg:grid-cols-2">
        <StampSection cards={stampCards} />
        <ClubSection members={clubMembers} />
      </div>
      <ReferralSection referrals={referrals} />
      <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
        <p className="font-medium text-stone-900">Script de atención</p>
        <p className="mt-2 italic">
          «¿De dónde nos visitáis?» → rasca o sello → «Si quieres, te apunto al Club de la Sierra
          por WhatsApp para novedades y cestas de temporada.»
        </p>
        <p className="mt-2 text-xs text-stone-500">
          Tono: «En la sierra se agradece la visita y se recompensa al que vuelve.» Sin agresividad
          comercial.
        </p>
      </section>
    </div>
  );
}
