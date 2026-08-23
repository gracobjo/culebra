# Sensibilidad con retrasos — tesorería

![Logo Sabores de la Culebra](./imagenes/logo.png)

Simulación centrada en la **variable más crítica** del proyecto: el **momento de cobro de la subvención**, junto con posibles retrasos en el **lanzamiento** y en la **generación de ventas (GMV)**.

**Referencias:** [`Flujo_Caja_Plan_Viabilidad.md`](./Flujo_Caja_Plan_Viabilidad.md) · [`Plan_Contingencia_Tesoreria.md`](./Plan_Contingencia_Tesoreria.md) · [`Plan_Viabilidad_Marketplace_Villardeciervos.md`](../Plan_Viabilidad_Marketplace_Villardeciervos.md) §5.O · simulador `/admin/plan`.

---

## 1. Escenario base de referencia

| Parámetro | Valor |
|-----------|------:|
| Capital inicial | **40.000 €** |
| Inversión ejecutada | **30.000 €** (Meses 1–6) |
| Subvención esperada | **22.200 €** |
| Cobro subvención (base) | **Mes 12** |
| Lanzamiento comercial (base) | **Mes 6** |
| GMV prudente | A1: **14.000 €** · A2: **48.000 €** · A3: **75.000 €** |
| Costes fijos mensuales (desde Mes 7) | **1.250 €** |
| Caja al cierre Año 1 (base) | **≈ 29.900 €** |
| Caja mínima durante el proyecto (base) | **≈ 8.500 – 9.500 €** |

---

## 2. Sensibilidad al retraso en el cobro de la subvención

| Momento de cobro | Retraso vs base | Caja mínima aprox. | Caja cierre A1 | Riesgo | Apoyo socios |
|------------------|-----------------|-------------------:|---------------:|:------:|--------------|
| Mes 9-10 | −2 / −3 meses | 13.000 – 15.000 € | 32.000 – 34.000 € | Bajo | No |
| **Mes 12** | **0** | **8.500 – 9.500 €** | **≈ 29.900 €** | **Medio** | **No (justo)** |
| Mes 14 | +2 meses | 5.500 – 6.500 € | 27.000 – 28.000 € | Alto | Recomendable |
| Mes 16 | +4 meses | 3.000 – 4.500 € | 25.000 – 26.500 € | Muy alto | Probable préstamo/aportación |
| Mes 18+ | +6 meses o más | < 2.500 € | < 25.000 € | Crítico | Casi seguro |
| No se cobra / −50 % | — | < 2.000 € | 15.000 – 18.000 € | Crítico | Sí |

**Lectura clave:** cada mes de retraso reduce la caja mínima en torno a **1.100 – 1.300 €**. A partir del **Mes 14–15** el colchón se vuelve peligroso.

---

## 3. Sensibilidad combinada: subvención + lanzamiento

| Escenario | Lanzamiento | Cobro subvención | Caja mínima aprox. | Evaluación |
|-----------|:-----------:|:----------------:|-------------------:|------------|
| Favorable | Mes 6 | Mes 10 | 14.000 – 16.000 € | Cómodo |
| **Base** | **Mes 6** | **Mes 12** | **8.500 – 9.500 €** | **Aceptable** |
| Retraso moderado | Mes 7-8 | Mes 14 | 4.500 – 6.000 € | Tenso |
| Retraso fuerte | Mes 8-9 | Mes 16 | 2.000 – 3.500 € | Alto riesgo |
| Doble retraso + GMV −20 % | Mes 8 | Mes 16 | < 2.000 € | Crítico |

---

## 4. Sensibilidad al retraso / debilidad en ventas (GMV)

Subvención en **Mes 12**, lanzamiento **Mes 6**:

| Nivel GMV | Año 1 | Año 2 | Caja cierre A2 (aprox.) | Comentario |
|-----------|------:|------:|------------------------:|------------|
| Base prudente | 14.000 € | 48.000 € | ≈ 21.500 € | Referencia |
| −20 % | 11.200 € | 38.400 € | ≈ 18.000 – 19.000 € | Todavía manejable |
| −40 % | 8.400 € | 28.800 € | ≈ 14.000 – 15.500 € | Caja más justa |
| Ventas casi nulas A1 | 4.000 € | 30.000 € | ≈ 12.000 – 13.500 € | Dependencia de subvención |

El GMV débil empeora la caja, pero tiene **menos impacto inmediato** que un retraso largo en la ayuda.

---

## 5. Mapa de riesgo de tesorería

| Situación | Probabilidad | Impacto en caja | Prioridad mitigación |
|-----------|:------------:|:---------------:|:--------------------:|
| Retraso cobro subvención (2–4 meses) | Media-Alta | Muy alto | **Máxima** |
| Retraso lanzamiento (1–2 meses) | Media | Medio | Alta |
| GMV por debajo de lo prudente | Media | Medio | Alta |
| Subvención denegada o muy reducida | Baja-Media | Crítico | **Máxima (plan B)** |
| Costes fijos más altos de lo previsto | Media | Alto | Alta |

---

## 6. Conclusiones y recomendaciones

1. El mayor riesgo de caja **no es el volumen de ventas**, sino el **retraso en el cobro de la subvención**.
2. El escenario base (Mes 12) deja un colchón **aceptable pero no holgado** (≈ 8.500–9.500 € mínimo).
3. Retraso **3–4 meses** (Mes 15–16) → zona de **riesgo alto**; conviene apoyo de socios.
4. **Doble retraso** (lanzamiento + cobro) puede poner la caja en situación **crítica**.

### Recomendaciones prácticas

- Priorizar calidad y rapidez de la **justificación**.
- Colchón mínimo **7.000–8.000 €**.
- Preacordar **préstamo participativo** o aportación si cobro > **Mes 14**.
- No comprometer gastos adicionales hasta confirmar calendario de pago de la ayuda.

**Plan operativo:** [`Plan_Contingencia_Tesoreria.md`](./Plan_Contingencia_Tesoreria.md) (niveles Verde/Amarillo/Naranja/Rojo, escenarios A/B/C, apoyo socios).

---

## Implementación en plataforma

| Función | Uso |
|---------|-----|
| `sensitivitySubsidyDelay()` | Tabla §2 |
| `sensitivityCombinedDelays()` | Tabla §3 |
| `sensitivityGmvDelay()` | Tabla §4 |
| `TREASURY_RISK_MAP` | Mapa §5 |
| `runCashFlowModel({ launchMonth, subsidyMonth, gmvByYear })` | Simulación interactiva |
