# Flujo de caja — escenario prudente

![Logo Sabores de la Culebra](./imagenes/logo.png)

Modelo de **tesorería real** del marketplace Villardeciervos, alineado al plan de viabilidad. Complementa el PyG contable (que puede ser negativo mientras la caja sigue siendo positiva gracias al capital y la subvención).

**Referencias:** [`Plan_Viabilidad_Marketplace_Villardeciervos.md`](../Plan_Viabilidad_Marketplace_Villardeciervos.md) §5.N · [`Modelo_Financiero_Detallado.md`](./Modelo_Financiero_Detallado.md) · [`Sensibilidad_Retrasos_Plan_Viabilidad.md`](./Sensibilidad_Retrasos_Plan_Viabilidad.md) · [`Plan_Contingencia_Tesoreria.md`](./Plan_Contingencia_Tesoreria.md) · [`Sensibilidad_Costes_Plan_Viabilidad.md`](./Sensibilidad_Costes_Plan_Viabilidad.md) · simulador `/admin/plan`.

---

## 1. Hipótesis principales

| Concepto | Valor |
|----------|------:|
| Capital social desembolsado | **40.000 €** (Mes 0) |
| Inversión elegible | **30.000 €** (Meses 1–6) |
| — de la cual desarrollo A.I + A.II | **14.500 € + 8.500 €** (= 23.000 €; dos servicios ≤ 15.000 €) |
| Subvención esperada (74 % sobre 30.000 €) | **22.200 €** |
| Momento estimado de cobro | Entre **Mes 10 y Mes 14** (tras justificación) |
| Escenario central de cobro | **Mes 12** |
| Comisión | **17 %** |
| GMV prudente | A1 (6 meses): **14.000 €** · A2: **48.000 €** · A3: **75.000 €** |
| Costes fijos mensuales (desde Mes 7) | **≈ 1.250 €** |
| Local | **Comodato** (sin alquiler) |
| Envío | **Pagado por el cliente** |

> **Nota crítica:** el momento exacto del cobro de la subvención es la variable de **mayor impacto en caja**. El resto del modelo es secundario frente a un retraso de la ayuda.

---

## 2. Flujo de caja Año 1 (mensual resumido)

| Mes | Concepto principal | Entradas | Salidas | Saldo mes | Saldo acumulado |
|-----|------------------|----------:|--------:|----------:|----------------:|
| 0 | Desembolso capital social | 40.000 € | — | +40.000 € | **40.000 €** |
| 1–2 | Constitución + inicio inversión + altas | — | 8.000 € | −8.000 € | **32.000 €** |
| 3–4 | Desarrollo + equipamiento + obras | — | 12.000 € | −12.000 € | **20.000 €** |
| 5–6 | Final inversión + lanzamiento | 1.200 € | 11.500 € | −10.300 € | **9.700 €** |
| 7–9 | Operativa (GMV bajo) | 3.500 € | 4.500 € | −1.000 € | **8.700 €** |
| 10–12 | Operativa + cobro subvención (Mes 12) | 3.500 € + 22.200 € | 4.500 € | +21.200 € | **29.900 €** |

### Resumen Año 1

| Indicador | Valor orientativo |
|-----------|------------------:|
| Caja mínima (antes de cobrar la subvención) | **≈ 8.000 – 10.000 €** |
| Caja al cierre del Año 1 (subvención Mes 12) | **≈ 29.000 – 30.000 €** |

---

## 3. Flujo de caja Años 1–3 (visión anual)

| Concepto | Año 1 | Año 2 | Año 3 |
|----------|------:|------:|------:|
| **Entradas** | | | |
| Capital social | 40.000 € | — | — |
| Subvención | 22.200 € | — | — |
| Ingresos por comisiones (17 %) | 2.380 € | 8.160 € | 12.750 € |
| **Total entradas** | **64.580 €** | **8.160 €** | **12.750 €** |
| **Salidas** | | | |
| Inversión (A.I+A.II desarrollo, equipos, obras…) | 30.000 € | — | — |
| Gastos operativos (marketing, cloud, gestoría, RETA, mantenimiento…) | 6.800 € | 16.500 € | 17.500 € |
| **Total salidas** | **36.800 €** | **16.500 €** | **17.500 €** |
| **Flujo neto del periodo** | **+27.780 €** | **−8.340 €** | **−4.750 €** |
| **Caja acumulada al cierre** | **≈ 29.900 €** | **≈ 21.560 €** | **≈ 16.810 €** |

---

## 4. Sensibilidad: momento de cobro de la subvención

| Momento de cobro | Caja mínima aprox. | Riesgo de tesorería | Comentario |
|------------------|-------------------:|:-------------------:|------------|
| Mes 9–10 (rápido) | 12.000 – 15.000 € | Bajo | Escenario favorable |
| **Mes 12 (central)** | **8.000 – 10.000 €** | **Medio** | **Referencia** |
| Mes 15–16 (lento) | 3.000 – 6.000 € | Alto | Puede requerir apoyo de socios |
| No se cobra / se reduce mucho | Puede bajar de 5.000 € | Muy alto | Escenario de estrés |

---

## 5. Lectura del modelo de caja

1. Los **primeros 6–9 meses** la caja depende casi exclusivamente del **capital social**. La inversión consume la mayor parte de los 40.000 €.
2. El **cobro de la subvención** es el punto de inflexión. Hasta entonces la empresa opera con caja ajustada.
3. A partir del **Año 2**, aunque el negocio siga en pérdidas contables moderadas, la caja se mantiene en niveles razonables gracias a la subvención ya cobrada.
4. Al cierre del **Año 3** la caja sigue siendo **positiva (≈ 16.000–17.000 €)** en el escenario central, aunque el resultado contable acumulado sea negativo.
5. El mayor riesgo de tesorería **no es el volumen de ventas**, sino un **retraso importante** en el cobro de la ayuda.

---

## 6. Recomendaciones de gestión de caja

1. Mantener siempre un **colchón mínimo de 6.000–8.000 €**.
2. **No repartir dividendos** ni retribuciones relevantes hasta tener la subvención cobrada y justificada.
3. Vigilar **mensualmente** el ritmo de ejecución de la inversión y el estado del expediente de justificación.
4. Tener previsto un posible **apoyo de socios** (préstamo participativo o aportación) si el cobro se retrasa más allá del **Mes 14–15**.
5. **Priorizar el comodato** del local: cualquier alquiler reduce de forma importante el colchón de caja.

---

## Implementación en plataforma

| Elemento | Ubicación |
|----------|-----------|
| Simulador de caja | `/admin/plan` → sección «Flujo de caja» |
| Motor | `apps/web/src/lib/financial-simulation.ts` → `runCashFlowModel()`, `sensitivitySubsidyTiming()` |
| Constantes | `CAPITAL_REF`, `SUBSIDY_REF`, `DEFAULT_SUBSIDY_MONTH = 12` |
