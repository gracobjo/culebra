# Cuenta de resultados 5 años — v4 (GMV prudente; comisión 17 %; sin envío gratis)

Fichero: `Modelo_Cuenta_Resultados_Marketplace_5_anos.xlsx`  
Script: `docs/datos_ine/populate_pyg_excel.py`  
Dossier: `docs/Dossier_Socios_Marketplace_Villardeciervos.md` (revisión ago-2026)

## Tesis financiera (v4)

El objetivo del caso base **no** es maximizar el beneficio a 5 años, sino:

1. **Estructurar inversión elegible 30–40.000 €** y captar la máxima ayuda (hasta **74 %** a fondo perdido).
2. Mantener una **operativa viable de bajo riesgo** (el cliente paga siempre el porte).
3. Aceptar un **neto acumulado ligeramente negativo** (~−3,7 k€ a −5 k€) porque la aportación real de socios es solo **~10.400 €**.

### Cálculo de referencia — inversión 40.000 €

| Concepto | Importe |
|----------|--------:|
| Inversión elegible | 40.000 € |
| Ayuda ICECYL (40 %) | 16.000 € |
| Complemento Diputación (hasta 74 %) | 13.600 € |
| **Subvención total** | **29.600 €** |
| **Aportación real socios** | **10.400 €** |

## Política comercial (hipótesis nuevas)

| Elemento | Valor |
|----------|------:|
| Comisión base | **17 %** |
| Mínimo por pedido | **4,00 €** (se aplica el mayor entre 17 % y 4 €) |
| Envío | **Tarifa plana 6,50 €** — siempre a cargo del cliente |
| Absorción de portes por la S.L. | **Ninguna** |
| Retención legal | **14 días** |
| Rappels orientativos | Bronce 17 % · Plata 14 % · Oro 12 % |

## Escenario CONSERVADOR (referencia de firma / justificación)

| Año | GMV | Ingresos 17 % | Gastos (orden) | Neto (orden) | Acumulado |
|----:|----:|-------------:|---------------:|-------------:|----------:|
| 1 | 16.000 | 2.720 | ≈ 7.100 | ≈ −4.380 | ≈ −4.380 |
| 2 | 55.000 | 9.350 | ≈ 14.800 | ≈ −5.450 | ≈ −9.830 |
| 3 | 90.000 | 15.300 | ≈ 16.900 | ≈ −1.600 | ≈ −11.430 |
| 4 | 120.000 | 20.400 | ≈ 18.200 | ≈ +2.200 | ≈ −9.230 |
| 5 | 145.000 | 24.650 | ≈ 19.100 | ≈ +5.550 | ≈ **−3.680** |

El Excel mensual puede diferir en cientos de euros por estacionalidad e IS orientativo; el **orden de magnitud** es el de esta tabla.

**Hipótesis de actividad (ticket medio 65 €):**

| Año | Pedidos/mes | Pedidos/día | GMV |
|----:|------------:|------------:|----:|
| 1 (6 meses) | 40–45 | 1,4–1,5 | 16.000 |
| 2 | 70–75 | 2,4–2,5 | 55.000 |
| 3 | 110–120 | 3,7–4 | 90.000 |
| 4 | ≈ 150 | ≈ 5 | 120.000 |
| 5 | 180–190 | ≈ 6,2 | 145.000 |

## Escenarios de sensibilidad (no son el caso base)

| Escenario | GMV Y1 → Y5 | Lectura |
|-----------|-------------|---------|
| Realista | 28k → 250k | Crecimiento si captura turística/digital mejora |
| Optimista | 40k → 380k | Techo ambicioso; **no** usar en justificación ante administración |

## Local en alquiler

Sigue documentado como alternativa (plan §5.F). El caso base asume **comodato**.

## Dashboard KPI

Hoja **`00_KPI_Dashboard`** alimentada por **`KPI_Datos`**. Tras abrir el Excel, recalcular (F9) si hace falta.
