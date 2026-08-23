# Sensibilidad de costes — Plan de viabilidad

![Logo Sabores de la Culebra](./imagenes/logo.png)

**Escenario prudente — Marketplace Villardeciervos**

Simulación centrada en las variables que más impactan en el **punto de equilibrio** y en el **resultado de los primeros años**.

**Referencias:** [`Plan_Viabilidad_Marketplace_Villardeciervos.md`](../Plan_Viabilidad_Marketplace_Villardeciervos.md) §5.M · [`Comparativa_Comision_15_vs_17.md`](./Comparativa_Comision_15_vs_17.md) · [`Flujo_Caja_Plan_Viabilidad.md`](./Flujo_Caja_Plan_Viabilidad.md) · simulador `/admin/plan`.

---

## 1. Escenario base de referencia (prudente)

| Parámetro | Valor base |
|-----------|------------|
| Comisión | **17 %** |
| Ticket medio | **62 €** |
| Costes fijos mensuales (Mes 7+) | **1.250 €** |
| GMV Año 1 (6 meses) | **14.000 €** |
| GMV Año 2 | **48.000 €** |
| GMV Año 3 | **75.000 €** |
| Resultado neto acumulado 3 años (aprox.) | **−16.260 €** |
| GMV de equilibrio mensual | **≈ 8.065 €** |

---

## 2. Sensibilidad a los costes fijos mensuales

| Costes fijos mensuales | GMV de equilibrio | Pedidos/mes necesarios | Impacto en resultado Año 2 | Impacto acumulado 3 años |
|------------------------|------------------:|-----------------------:|----------------------------|-------------------------:|
| **1.000 €** (muy contenido) | 6.450 € | 104 | Mejora ≈ +3.000 € | Mejora ≈ **+7.500 €** |
| **1.250 €** (base) | 8.065 € | 130 | — | — |
| **1.450 €** | 9.355 € | 151 | Empeora ≈ −2.400 € | Empeora ≈ **−6.000 €** |
| **1.650 €** (con alquiler o más estructura) | 10.645 € | 172 | Empeora ≈ −4.800 € | Empeora ≈ **−12.000 €** |

**Lectura:** cada **200 € mensuales** de más en costes fijos empeoran el acumulado de 3 años en torno a **4.500–6.000 €**.

---

## 3. Sensibilidad al gasto de marketing

| Marketing mensual medio | Efecto en costes fijos | Resultado orientativo Año 2 | Comentario |
|-------------------------|------------------------:|----------------------------|------------|
| **100 €** | Baja el fijo a ≈ 1.100 € | Mejor | Solo mantenimiento mínimo |
| **250 €** (base) | 1.250 € | Base | Equilibrio razonable |
| **400 €** | Sube a ≈ 1.400 € | Peor | Necesita mejor conversión |
| **600 €** | Sube a ≈ 1.600 € | Claramente peor | Solo justificable con tracción clara |

---

## 4. Sensibilidad al coste del RETA (Socio 2)

| Coste neto mensual RETA | Impacto anual | Impacto acumulado 3 años | Comentario |
|-------------------------|--------------:|-------------------------:|------------|
| **100 €** (con buena ayuda al autoempleo) | −1.200 € | −3.600 € | Escenario favorable |
| **200 €** (base) | −2.400 € | −7.200 € | Referencia actual |
| **300 €** (sin compensar) | −3.600 € | −10.800 € | Empeora de forma relevante |

---

## 5. Sensibilidad combinada (casos prácticos)

| Escenario | Costes fijos mensuales | Comisión | Resultado acumulado 3 años (aprox.) | Evaluación |
|-----------|------------------------:|:--------:|-----------------------------------:|------------|
| Optimista operativo | 1.050 € | 17 % | −10.000 € / −12.000 € | Mucho más manejable |
| **Base prudente** | **1.250 €** | **17 %** | **−16.260 €** | **Referencia** |
| Con alquiler del local | 1.550 € | 17 % | −22.000 € / −24.000 € | Claramente peor |
| Comisión 15 % + costes base | 1.250 € | 15 % | −21.500 € | Peor que el base |
| Comisión 17 % + marketing alto | 1.450 € | 17 % | −20.000 € / −22.000 € | Se come parte de la ventaja |

---

## 6. Variables de mayor impacto (ordenadas)

| Prioridad | Variable | Impacto | Capacidad de control |
|:---------:|----------|---------|----------------------|
| 1 | Costes fijos (local, personal, estructura) | Muy alto | Alta (comodato vs alquiler, RETA, marketing) |
| 2 | Comisión | Alto | Alta (decisión: **17 %**) |
| 3 | Marketing | Medio-alto | Alta |
| 4 | Coste RETA del Socio 2 | Medio | Media (depende de ayudas) |
| 5 | Ticket medio | Medio | Media (mix de productos y cestas) |

---

## 7. Conclusiones para el plan de viabilidad

1. El factor que **más mueve el resultado** es el nivel de **costes fijos**. Mantener el local en **comodato** y la estructura muy ligera es crítico.
2. Subir la comisión de **15 % a 17 %** mejora el escenario de forma clara y medible (ver [`Comparativa_Comision_15_vs_17.md`](./Comparativa_Comision_15_vs_17.md)).
3. El **marketing** debe mantenerse contenido (**250–300 €/mes** de media) hasta que haya tracción real.
4. El coste del **RETA** del Socio 2 debe vigilarse; cualquier ayuda al autoempleo mejora notablemente el cuadro.
5. El escenario con **alquiler del local** degrada de forma importante las cifras y debería evitarse si es posible.

### Recomendación adoptada

> Mantener como escenario base el de **comisión 17 % + costes fijos ≈ 1.250 €**. Cualquier desviación al alza en estructura debe compensarse con más volumen o, en último caso, con una comisión ligeramente superior.

---

## Implementación en plataforma

| Elemento | Ubicación |
|----------|-----------|
| Simulador interactivo | `/admin/plan` → `PlanSimulator` |
| Motor de cálculo | `apps/web/src/lib/financial-simulation.ts` |
| Funciones de sensibilidad | `sensitivityFixedCosts()`, `sensitivityMarketing()`, `sensitivityReta()`, `sensitivityCombinedScenarios()` |
| Presets de escenario | `PRESET_SCENARIOS` (base, optimista, alquiler, 15 %, marketing alto) |
