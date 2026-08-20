# -*- coding: utf-8 -*-
"""Construye tabla maestra de mercado a partir de CSV oficiales INE."""
from __future__ import annotations

import csv
import re
from collections import defaultdict
from pathlib import Path
from statistics import mean

BASE = Path(__file__).resolve().parent


def to_float(s: str | None) -> float | None:
    s = (s or "").strip()
    if s in ("", ".", "..", "...", "-"):
        return None
    if re.fullmatch(r"-?\d{1,3}(\.\d{3})+", s):
        return float(s.replace(".", ""))
    if "," in s:
        return float(s.replace(".", "").replace(",", "."))
    try:
        return float(s)
    except ValueError:
        return None


def read_csv(name: str) -> tuple[list[str], list[dict[str, str]]]:
    path = BASE / name
    with path.open(encoding="latin-1", newline="") as f:
        rows = list(csv.DictReader(f, delimiter=";"))
    return list(rows[0].keys()), rows


def fmt(n: float | None, decimals: int = 0) -> str:
    if n is None:
        return "—"
    if decimals == 0:
        return f"{n:,.0f}".replace(",", ".")
    return f"{n:,.{decimals}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def main() -> None:
    # --- 2073 viajeros / pernoctaciones ---
    k, rows = read_csv("2073_viajeros_pernoctaciones_provincias.csv")
    zam = [r for r in rows if "Zamora" in r[k[0]]]

    annual: dict[int, dict[str, float]] = {}
    months_ok: dict[int, set[int]] = defaultdict(set)
    monthly: dict[tuple[int, int], dict[str, float]] = defaultdict(lambda: defaultdict(float))

    for r in zam:
        per = r[k[3]]
        if "M" not in per:
            continue
        y_s, m_s = per.split("M")
        y, m = int(y_s), int(m_s)
        if y < 2019 or y > 2025:
            continue
        val = to_float(r[k[4]])
        if val is None:
            continue
        months_ok[y].add(m)
        ind = r[k[1]]
        res = "ES" if "Espa" in r[k[2]] else "EX"
        key = f"{ind}_{res}"
        annual.setdefault(y, defaultdict(float))
        annual[y][key] += val
        monthly[(y, m)][key] += val

    print("=== ZAMORA TURISMO RURAL (INE 2073) ===")
    print(
        "Año | Viajeros | ES | EX | Pernoctaciones | ES | EX | Estancia calc. | Meses con dato"
    )
    for y in range(2019, 2026):
        a = annual.get(y, {})
        v = a.get("Viajero_ES", 0) + a.get("Viajero_EX", 0)
        p = a.get("Pernoctaciones_ES", 0) + a.get("Pernoctaciones_EX", 0)
        est = (p / v) if v else None
        print(
            f"{y} | {fmt(v)} | {fmt(a.get('Viajero_ES'))} | {fmt(a.get('Viajero_EX'))} | "
            f"{fmt(p)} | {fmt(a.get('Pernoctaciones_ES'))} | {fmt(a.get('Pernoctaciones_EX'))} | "
            f"{fmt(est, 2)} | {sorted(months_ok[y])}"
        )

    print("\n=== AGOSTO (verificación) ===")
    for y in (2020, 2022, 2024):
        d = monthly[(y, 8)]
        v = d.get("Viajero_ES", 0) + d.get("Viajero_EX", 0)
        p = d.get("Pernoctaciones_ES", 0) + d.get("Pernoctaciones_EX", 0)
        print(
            f"{y}M08 viajeros={fmt(v)} (ES {fmt(d.get('Viajero_ES'))} + EX {fmt(d.get('Viajero_EX'))}) "
            f"pernoct={fmt(p)} estancia={fmt(p/v if v else None, 2)}"
        )

    # --- 2070 oferta ---
    k, rows = read_csv("2070_establecimientos_provincias.csv")
    zam = [r for r in rows if "Zamora" in r[k[0]]]
    print("\n=== ZAMORA OFERTA (INE 2070) — medias mensuales ===")
    for y in range(2019, 2026):
        by_ind: dict[str, list[float]] = defaultdict(list)
        for r in zam:
            if not r[k[2]].startswith(f"{y}M"):
                continue
            v = to_float(r[k[3]])
            if v is None:
                continue
            by_ind[r[k[1]]].append(v)
        if not by_ind:
            continue
        estab = mean(by_ind.get("Número de establecimientos abiertos estimados", [0])) if by_ind.get("Número de establecimientos abiertos estimados") else None
        plazas = mean(by_ind.get("Número de plazas estimadas", [0])) if by_ind.get("Número de plazas estimadas") else None
        ocup = mean(by_ind.get("Grado de ocupación por plazas", [0])) if by_ind.get("Grado de ocupación por plazas") else None
        # encoding-safe fallbacks
        for ind, vals in by_ind.items():
            if "establecimientos" in ind.lower():
                estab = mean(vals)
            elif "plazas estimadas" in ind.lower() or ind.lower().endswith("plazas estimadas"):
                plazas = mean(vals)
            elif "ocupaci" in ind.lower() and "plazas" in ind.lower() and "fin" not in ind.lower():
                ocup = mean(vals)
        print(f"{y}: estab_media={fmt(estab,1)} plazas_media={fmt(plazas,1)} ocup_plazas_media={fmt(ocup,2)}% n_meses_estab={len(by_ind.get(list(by_ind)[0], []))}")

    # --- 2067 estancia media oficial ---
    k, rows = read_csv("2067_estancia_media_provincias.csv")
    zam = [r for r in rows if "Zamora" in r[k[0]]]
    print("\n=== ZAMORA ESTANCIA MEDIA OFICIAL (INE 2067) ===")
    for y in range(2019, 2026):
        vals = []
        ago = None
        for r in zam:
            per = r[k[1]]
            if not per.startswith(f"{y}M"):
                continue
            v = to_float(r[k[2]])
            if v is None:
                continue
            vals.append(v)
            if per.endswith("M08"):
                ago = v
        if vals:
            print(f"{y}: media_meses={fmt(mean(vals),2)} agosto={fmt(ago,2)} n={len(vals)}")

    # --- 2006 procedencia: Castilla y León destino ---
    k, rows = read_csv("2006_procedencia_porcentual.csv")
    print("\n=== PROCEDENCIA (INE 2006) — estructura ===")
    print("keys:", k)
    # Find CyL as destination
    cyl_rows = []
    for r in rows:
        vals = list(r.values())
        joined = " | ".join(vals)
        if "Castilla y Le" in joined and "2024M" in joined:
            cyl_rows.append(r)
    print("CyL 2024 rows sample:", len(cyl_rows))
    if cyl_rows:
        for r in cyl_rows[:8]:
            print(r)

    # Better: detect destination/origin columns
    # Header was: Totales Territoriales;Comunidades...;Viajeros...;Totales Territoriales;Comunidades...;Periodo;Total
    dest_col, origin_col = k[0], k[1]
    # Actually looking at sample: Total Nacional;;Viajero;Total Nacional;;2026M06;100
    # Might be nested. Let's print unique values
    print("unique col0:", sorted({r[k[0]] for r in rows if r[k[0]]})[:30])
    print("unique col1:", sorted({r[k[1]] for r in rows if r[k[1]]})[:30])
    print("unique col3:", sorted({r[k[3]] for r in rows if r[k[3]]})[:20])
    print("unique col4:", sorted({r[k[4]] for r in rows if r[k[4]]})[:30])

    # Extract CyL destination x origin for 2024 annual if exists, else latest month 2024M08 or sum
    # Prefer destination = Castilla y León
    out_lines = []
    out_lines.append("# Tabla maestra de mercado — extracción oficial (borrador)\n")
    out_lines.append("## NIVEL 3 — Provincia de Zamora | Turismo rural (EOTR)\n")
    out_lines.append("Fuente: INE, Encuesta de Ocupación en Alojamientos de Turismo Rural.\n")
    out_lines.append("- Viajeros/pernoctaciones: tabla 2073\n")
    out_lines.append("- Establecimientos/plazas/ocupación: tabla 2070\n")
    out_lines.append("- Estancia media: tabla 2067\n")
    out_lines.append("- Snapshot anual con meses (año 2024): tabla TPX 75448 (coincide con total 2024 de 2073)\n\n")
    out_lines.append("| Año | Viajeros | Residentes ES | Extranjero | Pernoctaciones | Estancia calc. | Meses con dato | Calidad |\n")
    out_lines.append("|----:|--------:|--------------:|-----------:|---------------:|---------------:|:---------------|:--------|\n")
    for y in range(2019, 2026):
        a = annual.get(y, {})
        v = a.get("Viajero_ES", 0) + a.get("Viajero_EX", 0)
        p = a.get("Pernoctaciones_ES", 0) + a.get("Pernoctaciones_EX", 0)
        est = (p / v) if v else None
        ms = sorted(months_ok[y])
        calidad = "serie completa 12 meses" if len(ms) == 12 else f"parcial ({len(ms)} meses; COVID/suspensión posible)"
        if y == 2020 and len(ms) < 12:
            calidad = "año COVID; serie parcial en algunos indicadores provinciales"
        out_lines.append(
            f"| {y} | {fmt(v)} | {fmt(a.get('Viajero_ES'))} | {fmt(a.get('Viajero_EX'))} | {fmt(p)} | {fmt(est,2)} | {', '.join(map(str, ms))} | {calidad} |\n"
        )

    # oferta annual means
    k, rows = read_csv("2070_establecimientos_provincias.csv")
    zam = [r for r in rows if "Zamora" in r[k[0]]]
    out_lines.append("\n### Oferta media mensual (INE 2070)\n\n")
    out_lines.append("| Año | Establecimientos abiertos (media) | Plazas (media) | Ocupación plazas (media %) |\n")
    out_lines.append("|----:|----------------------------------:|---------------:|---------------------------:|\n")
    for y in range(2019, 2026):
        by_ind: dict[str, list[float]] = defaultdict(list)
        for r in zam:
            if not r[k[2]].startswith(f"{y}M"):
                continue
            v = to_float(r[k[3]])
            if v is None:
                continue
            by_ind[r[k[1]]].append(v)
        estab = plazas = ocup = None
        for ind, vals in by_ind.items():
            low = ind.lower()
            if "establecimientos" in low:
                estab = mean(vals)
            elif "plazas estimadas" in low:
                plazas = mean(vals)
            elif "ocupaci" in low and "plazas" in low and "fin" not in low and "habit" not in low:
                ocup = mean(vals)
        out_lines.append(f"| {y} | {fmt(estab,1)} | {fmt(plazas,1)} | {fmt(ocup,2)} |\n")

    out_path = BASE / "Tabla_Maestra_Mercado_borrador.md"
    out_path.write_text("".join(out_lines), encoding="utf-8")
    print(f"\nEscrito: {out_path}")

    # Procedencia CyL 2024M08 or 2024 annual if available
    k, rows = read_csv("2006_procedencia_porcentual.csv")
    # Try to find rows where destination is Castilla y León
    # Columns appear duplicated; inspect a CyL row carefully
    print("\n=== Buscando procedencia destino CyL ===")
    for r in rows:
        if r.get(k[0], "").startswith("07 Castilla") or r.get(k[0], "") == "07 Castilla y León":
            if r[k[5]].startswith("2024M08") or r[k[5]] == "2024":
                print(r)
                break
    # Print all origins for CyL destination, Viajero, 2024M08
    targets = []
    for r in rows:
        dest = r.get(k[0], "")
        period = r.get(k[5], "")
        indicator = r.get(k[2], "")
        if "Castilla y Le" in dest and period == "2024M08" and indicator.startswith("Viajero"):
            origin = r.get(k[4], "") or r.get(k[1], "")
            val = to_float(r.get(k[6], ""))
            targets.append((origin, val, r))
    print(f"CyL Viajero 2024M08 origins found: {len(targets)}")
    for o, v, _ in sorted(targets, key=lambda x: -(x[1] or 0))[:20]:
        print(f"  {o}: {v}")


if __name__ == "__main__":
    main()
