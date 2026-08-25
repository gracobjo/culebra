"""
Genera un dataset sintético diario del showroom Sabores de la Culebra
alineado con docs/Variables_Decision_Datasets_Kaggle.md §4 y el esquema mínimo §5.

Uso (venv activo):
  python ml/generate_culebra_synthetic.py
  python ml/generate_culebra_synthetic.py --days 730 --seed 42
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "data" / "synthetic"
OUT_CSV = OUT_DIR / "culebra_showroom_daily.csv"
OUT_DICT = OUT_DIR / "culebra_showroom_data_dictionary.csv"


def season_for(month: int) -> str:
    if month in (12, 1, 2):
        return "Invierno"
    if month in (3, 4, 5):
        return "Primavera"
    if month in (6, 7, 8):
        return "Verano"
    return "Otoño"  # berrea / puentes


def is_open_day(ts: pd.Timestamp, rng: np.random.Generator) -> bool:
    """Showroom rural: fines de semana + más días en temporada alta."""
    wd = ts.dayofweek  # 0=lun … 6=dom
    month = ts.month
    # Siempre sáb-dom
    if wd >= 5:
        return True
    # Viernes en verano / Navidad / berrea
    if wd == 4 and month in (6, 7, 8, 9, 10, 12):
        return rng.random() < 0.75
    # Algún entre semana en agosto / puente
    if month in (7, 8) and wd in (1, 2, 3):
        return rng.random() < 0.35
    if month == 12 and ts.day >= 15:
        return rng.random() < 0.45
    return rng.random() < 0.08


def holiday_or_event(ts: pd.Timestamp) -> int:
    month, day = ts.month, ts.day
    # Navidad / Reyes
    if month == 12 and day >= 20:
        return 1
    if month == 1 and day <= 6:
        return 1
    # Semana Santa aproximada (marzo-abril, marcamos algunos)
    if month in (3, 4) and ts.dayofweek >= 4 and 10 <= day <= 25:
        return 1
    # Berrea pico (segunda quincena sept – oct)
    if (month == 9 and day >= 15) or (month == 10 and day <= 20):
        return 1
    # Puente mayo / agosto 15
    if (month == 5 and day >= 1 and day <= 4) or (month == 8 and 14 <= day <= 16):
        return 1
    return 0


def market_segment_draw(rng: np.random.Generator, referred_share: float) -> str:
    """Proxy canal (mapa Kaggle market_segment)."""
    r = rng.random()
    if r < referred_share:
        return "Rural_lodging"
    if r < referred_share + 0.12:
        return "Event_local"
    if r < referred_share + 0.12 + 0.18:
        return "Passerby"
    return "Direct"


def generate(days: int, seed: int, start: str) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    dates = pd.date_range(start=start, periods=days, freq="D")
    rows: list[dict] = []

    tote_stock = 40
    partners_active = 2  # crece con el tiempo
    contact_pool = 0

    for i, ts in enumerate(dates):
        open_flag = int(is_open_day(ts, rng))
        season = season_for(ts.month)
        holiday = holiday_or_event(ts)
        promotion = int(holiday == 1 or (open_flag and rng.random() < 0.15))

        # Partners: ramp-up en ~18 meses
        progress = min(1.0, i / 540)
        partners_active = int(np.clip(2 + progress * 10 + rng.normal(0, 0.3), 2, 14))

        if not open_flag:
            rows.append(
                {
                    "date": ts.strftime("%Y-%m-%d"),
                    "open": 0,
                    "Customer_Footfall": 0,
                    "visits": 0,
                    "purchases": 0,
                    "conversion_rate": 0.0,
                    "Sales_Amount": 0.0,
                    "gmv": 0.0,
                    "avg_ticket_base": 0.0,
                    "avg_ticket_with_impulse": 0.0,
                    "impulse_attach_pct": 0.0,
                    "impulse_avg_eur": 0.0,
                    "items_per_ticket": 0.0,
                    "quick_buy_pct": 0.0,
                    "quick_buy_ticket": 0.0,
                    "miel_u": 0,
                    "loncheado_u": 0,
                    "mermelada_u": 0,
                    "queso_u": 0,
                    "tote_u": 0,
                    "picos_u": 0,
                    "vino_u": 0,
                    "minicata_u": 0,
                    "Units_Sold": 0,
                    "Inventory_Level": tote_stock,
                    "tote_stock": tote_stock,
                    "Online_Orders": 0,
                    "online_orders_attr": 0,
                    "contacts": 0,
                    "campaign_conversions": 0,
                    "referred_visits": 0,
                    "baskets_via_lodging": 0,
                    "market_segment": "Closed",
                    "distribution_channel": "None",
                    "Promotion": "No",
                    "Holiday": "Yes" if holiday else "No",
                    "holiday_or_event": holiday,
                    "Season": season,
                    "Day_Of_Week": ts.day_name(),
                    "Month": ts.month,
                    "Year": ts.year,
                    "partners_active": partners_active,
                    "Demand_Level": "None",
                }
            )
            continue

        # Tráfico base por temporada
        season_mult = {
            "Invierno": 0.7,
            "Primavera": 1.0,
            "Verano": 1.45,
            "Otoño": 1.25,
        }[season]
        if holiday:
            season_mult *= 1.35
        if promotion and not holiday:
            season_mult *= 1.1

        # Visitas ~ Poisson alrededor de 12–18 tipico showroom
        lam = 11 * season_mult
        if ts.dayofweek == 5:
            lam *= 1.15
        if ts.dayofweek == 6:
            lam *= 1.25
        visits = int(np.clip(rng.poisson(lam), 4, 42))

        # Conversión 22–42 % (meta ≥ 30–35)
        conv = float(np.clip(rng.normal(0.32 if not holiday else 0.38, 0.05), 0.18, 0.48))
        if promotion:
            conv = min(0.50, conv + 0.03)
        purchases = int(np.clip(rng.binomial(visits, conv), 1, visits))

        # Ticket base cestas ~ 34–42
        avg_ticket_base = float(np.clip(rng.normal(37.5 if holiday else 35.5, 3.5), 28, 48))

        # Impulso en caja
        attach = float(np.clip(rng.normal(0.42 if promotion else 0.35, 0.08), 0.10, 0.70))
        impulse_avg = float(np.clip(rng.normal(7.2 if promotion else 6.0, 1.8), 2.5, 12.5))
        ticket_with_impulse = avg_ticket_base + attach * impulse_avg

        quick_buy_pct = float(np.clip(rng.normal(0.24, 0.06), 0.08, 0.45))
        quick_buy_ticket = float(np.clip(rng.normal(15.5, 2.0), 11, 22))

        gmv = round(purchases * ticket_with_impulse, 2)

        # SKU lista de 8 — proporcionales a compras + ruido
        scale = purchases / 8.0
        miel_u = max(0, int(rng.poisson(scale * 1.1)))
        loncheado_u = max(0, int(rng.poisson(scale * 0.95)))
        mermelada_u = max(0, int(rng.poisson(scale * 0.75)))
        queso_u = max(0, int(rng.poisson(scale * 0.55)))
        picos_u = max(0, int(rng.poisson(scale * 0.85)))
        vino_u = max(0, int(rng.poisson(scale * 0.35 + (0.4 if holiday else 0))))
        minicata_u = max(0, int(rng.poisson(max(0.4, visits * 0.06))))
        # Tote: margen propio, menos unidades
        tote_u = max(0, int(rng.poisson(scale * 0.35 + (0.3 if promotion else 0))))
        tote_u = min(tote_u, tote_stock)
        tote_stock = max(0, tote_stock - tote_u)
        # Reposición quincenal aproximada
        if ts.day in (1, 15) and tote_stock < 25:
            tote_stock = min(50, tote_stock + int(rng.integers(15, 30)))

        units_sold = (
            miel_u
            + loncheado_u
            + mermelada_u
            + queso_u
            + tote_u
            + picos_u
            + vino_u
            + minicata_u
        )
        items_per_ticket = round(units_sold / max(purchases, 1), 2)

        # Captación ~ 35–50 % de compradores
        capture = float(np.clip(rng.normal(0.40, 0.07), 0.15, 0.65))
        contacts = int(round(purchases * capture))
        contact_pool += contacts
        # Campañas: una fracción de contactos “convierten” a online en días siguientes (proxy mismo día)
        online_attr = int(rng.binomial(max(1, contacts), 0.08 if not holiday else 0.12))
        online_orders = online_attr + int(rng.poisson(0.3))

        # Referidos alojamientos
        referred_share = min(0.35, 0.08 + partners_active * 0.018)
        referred_visits = int(np.clip(rng.binomial(visits, referred_share), 0, visits))
        baskets_via = int(rng.binomial(max(1, referred_visits), 0.22))

        segment = market_segment_draw(rng, referred_share)
        channel = {
            "Rural_lodging": "Partner_referral",
            "Event_local": "Offline_event",
            "Passerby": "Walk_in",
            "Direct": "Direct",
        }[segment]

        # Demand level (como Kaggle Forecast)
        if gmv >= 900:
            demand = "High"
        elif gmv >= 450:
            demand = "Medium"
        else:
            demand = "Low"

        rows.append(
            {
                "date": ts.strftime("%Y-%m-%d"),
                "open": 1,
                "Customer_Footfall": visits,
                "visits": visits,
                "purchases": purchases,
                "conversion_rate": round(purchases / visits, 4),
                "Sales_Amount": gmv,
                "gmv": gmv,
                "avg_ticket_base": round(avg_ticket_base, 2),
                "avg_ticket_with_impulse": round(ticket_with_impulse, 2),
                "impulse_attach_pct": round(attach * 100, 1),
                "impulse_avg_eur": round(impulse_avg, 2),
                "items_per_ticket": items_per_ticket,
                "quick_buy_pct": round(quick_buy_pct * 100, 1),
                "quick_buy_ticket": round(quick_buy_ticket, 2),
                "miel_u": miel_u,
                "loncheado_u": loncheado_u,
                "mermelada_u": mermelada_u,
                "queso_u": queso_u,
                "tote_u": tote_u,
                "picos_u": picos_u,
                "vino_u": vino_u,
                "minicata_u": minicata_u,
                "Units_Sold": units_sold,
                "Inventory_Level": tote_stock,
                "tote_stock": tote_stock,
                "Online_Orders": online_orders,
                "online_orders_attr": online_attr,
                "contacts": contacts,
                "campaign_conversions": online_attr,
                "referred_visits": referred_visits,
                "baskets_via_lodging": baskets_via,
                "market_segment": segment,
                "distribution_channel": channel,
                "Promotion": "Yes" if promotion else "No",
                "Holiday": "Yes" if holiday else "No",
                "holiday_or_event": holiday,
                "Season": season,
                "Day_Of_Week": ts.day_name(),
                "Month": ts.month,
                "Year": ts.year,
                "partners_active": partners_active,
                "Demand_Level": demand,
            }
        )

    return pd.DataFrame(rows)


DICTIONARY = [
    ("date", "Fecha del día", "Culebra / Kaggle Date"),
    ("open", "1 si el showroom abre", "Culebra"),
    ("Customer_Footfall", "Visitas (alias Kaggle)", "Kaggle footfall ↔ visits"),
    ("visits", "Visitas showroom", "Culebra"),
    ("purchases", "Compras del día", "Culebra"),
    ("conversion_rate", "purchases / visits", "Derivada (mapa §4)"),
    ("Sales_Amount", "GMV € (alias Kaggle)", "Kaggle Sales_Amount ↔ gmv"),
    ("gmv", "GMV € del día", "Culebra"),
    ("avg_ticket_base", "Ticket medio sin impulso €", "Culebra"),
    ("avg_ticket_with_impulse", "Ticket con impulso €", "Culebra"),
    ("impulse_attach_pct", "% ventas con añadido en caja", "Culebra / attach"),
    ("impulse_avg_eur", "€ medios de impulso cuando hay attach", "Culebra meta 4–12"),
    ("items_per_ticket", "Unidades lista-8 / compras", "Proxy impulso / Instacart"),
    ("quick_buy_pct", "% compra rápida sin cesta", "Culebra"),
    ("quick_buy_ticket", "Ticket medio compra rápida €", "Culebra 12–20"),
    ("miel_u", "Uds miel 250 g", "Units_Sold SKU"),
    ("loncheado_u", "Uds embutido loncheado", "Units_Sold SKU"),
    ("mermelada_u", "Uds mermelada", "Units_Sold SKU"),
    ("queso_u", "Uds queso cuña", "Units_Sold SKU"),
    ("tote_u", "Uds tote bag", "Units_Sold SKU"),
    ("picos_u", "Uds picos/regañás", "Units_Sold SKU"),
    ("vino_u", "Uds vino/licor", "Units_Sold SKU"),
    ("minicata_u", "Uds mini-cata", "Units_Sold SKU"),
    ("Units_Sold", "Suma unidades lista de 8", "Kaggle Units_Sold"),
    ("Inventory_Level", "Stock tote fin de día", "Kaggle Inventory_Level"),
    ("tote_stock", "Stock tote (alias Culebra)", "Culebra"),
    ("Online_Orders", "Pedidos online del día", "Kaggle Online_Orders"),
    ("online_orders_attr", "Pedidos online atribuidos a showroom", "Culebra"),
    ("contacts", "Contactos captados", "Culebra captación"),
    ("campaign_conversions", "Proxy conversiones campaña (= online_attr)", "Kaggle campaigns"),
    ("referred_visits", "Visitas referidas por alojamientos", "Culebra"),
    ("baskets_via_lodging", "Cestas vía partners", "Culebra"),
    ("market_segment", "Canal dominante del día", "Kaggle market_segment"),
    ("distribution_channel", "Canal distribución", "Kaggle distribution_channel"),
    ("Promotion", "Yes/No promo o empujón comercial", "Kaggle Promotion"),
    ("Holiday", "Yes/No festivo/evento", "Kaggle Holiday"),
    ("holiday_or_event", "0/1 festivo o evento", "Culebra"),
    ("Season", "Estación", "Kaggle Season"),
    ("Day_Of_Week", "Día semana", "Kaggle"),
    ("Month", "Mes", "Kaggle"),
    ("Year", "Año", "Kaggle"),
    ("partners_active", "Partners alojamiento activos (proxy)", "Culebra CRM"),
    ("Demand_Level", "Low/Medium/High según GMV", "Kaggle Demand_Level"),
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Dataset sintético showroom Culebra")
    parser.add_argument("--days", type=int, default=730, help="Días de calendario (default 2 años)")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--start", type=str, default="2024-01-01")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    df = generate(args.days, args.seed, args.start)
    df.to_csv(OUT_CSV, index=False)
    pd.DataFrame(DICTIONARY, columns=["column", "description", "maps_to"]).to_csv(
        OUT_DICT, index=False
    )

    open_days = int(df["open"].sum())
    print(f"Escrito: {OUT_CSV}")
    print(f"Diccionario: {OUT_DICT}")
    print(f"Filas: {len(df)} · días abiertos: {open_days}")
    print(f"GMV total abierto: {df.loc[df.open == 1, 'gmv'].sum():,.0f} €")
    print(f"Visitas medias (abierto): {df.loc[df.open == 1, 'visits'].mean():.1f}")
    print(f"Conversión media (abierto): {df.loc[df.open == 1, 'conversion_rate'].mean():.1%}")
    print(f"Ticket medio con impulso: {df.loc[df.open == 1, 'avg_ticket_with_impulse'].mean():.1f} €")


if __name__ == "__main__":
    main()
