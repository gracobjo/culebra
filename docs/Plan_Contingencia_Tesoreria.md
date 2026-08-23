# Plan de Contingencia de Tesorería

![Logo Sabores de la Culebra](./imagenes/logo.png)

**Marketplace Villardeciervos / Sabores de la Culebra**

Plan operativo para sostener obligaciones de pago ante retrasos de la subvención o desviaciones negativas de ventas. Complementa el flujo de caja y la sensibilidad con retrasos.

**Referencias:** [`Plan_Viabilidad_Marketplace_Villardeciervos.md`](../Plan_Viabilidad_Marketplace_Villardeciervos.md) §5.P · [`Flujo_Caja_Plan_Viabilidad.md`](./Flujo_Caja_Plan_Viabilidad.md) · [`Sensibilidad_Retrasos_Plan_Viabilidad.md`](./Sensibilidad_Retrasos_Plan_Viabilidad.md) · simulador `/admin/plan`.

---

## 1. Objetivo

Garantizar que la sociedad pueda hacer frente a sus obligaciones de pago (proveedores, RETA, gestoría, cloud, mantenimiento mínimo y gastos críticos) en caso de **retrasos en el cobro de la subvención** o de **desviaciones negativas en las ventas**, evitando la suspensión de la actividad o la necesidad de decisiones precipitadas.

---

## 2. Niveles de alerta de caja

| Nivel | Caja disponible | Situación | Acción principal |
|:-----:|----------------:|:---------:|------------------|
| **Verde** | > 12.000 € | Normal | Seguimiento mensual ordinario |
| **Amarillo** | 8.000 – 12.000 € | Vigilancia | Congelar gastos no críticos + seguimiento quincenal |
| **Naranja** | 5.000 – 8.000 € | Tensión | Activar medidas de contención + preparar apoyo de socios |
| **Rojo** | < 5.000 € | Crítico | Activar plan de apoyo de socios de forma inmediata |

**Caja mínima de seguridad:** **7.000 €**.

---

## 3. Escenarios de contingencia y respuestas

### Escenario A — Retraso moderado de la subvención (cobro entre Mes 13 y 15)

- **Probabilidad:** Media-Alta  
- **Impacto:** Medio-Alto  

**Medidas:**

1. Congelar todo gasto no estrictamente necesario (marketing por encima del mínimo, mejoras, viajes, etc.).
2. Reducir marketing al mínimo de mantenimiento (**100–150 €/mes**).
3. Revisar y negociar aplazamiento de pagos no críticos con proveedores.
4. Informar a los socios de la situación y del calendario actualizado.
5. Preparar documentación para una posible aportación o préstamo participativo.

### Escenario B — Retraso importante (cobro entre Mes 16 y 18)

- **Probabilidad:** Media  
- **Impacto:** Alto  

**Medidas:**

1. Activar de forma inmediata el apoyo de socios (ver §4).
2. Reducir costes fijos al mínimo vital (objetivo: bajar de **1.250 €** a ≈ **900–1.000 €/mes** si es posible).
3. Priorizar únicamente: gestoría, cloud esencial, RETA del Socio 2 y mantenimiento técnico mínimo.
4. Suspender temporalmente cualquier acción comercial de pago.
5. Comunicación transparente y documentada a todos los socios.

### Escenario C — Retraso grave o reducción importante de la subvención

- **Probabilidad:** Baja-Media  
- **Impacto:** Crítico  

**Medidas:**

1. Convocatoria urgente de Junta / reunión de socios.
2. Aportación obligatoria o préstamo participativo según lo establecido en el Pacto de Socios.
3. Evaluación de posibles recortes adicionales de actividad.
4. Análisis de viabilidad de continuidad vs. redimensionamiento del proyecto.
5. En último extremo, valorar la suspensión temporal de la actividad operativa manteniendo solo lo imprescindible para no perder la elegibilidad de la ayuda.

---

## 4. Mecanismos de apoyo de los socios (Pacto de Socios)

Se recomienda dejar **preacordado** lo siguiente:

### Préstamo participativo de socios

| Concepto | Orientación |
|----------|-------------|
| Importe máximo | **8.000 – 12.000 €** (repartido según % de participación o acuerdo) |
| Tipo de interés | Bajo o **0 %** durante los primeros 12 meses |
| Devolución | Preferente cuando la caja supere de forma estable los **15.000 €**, o con cargo a la subvención cuando se cobre |

### Aportación adicional de capital (ampliación)

Solo si el préstamo participativo no es suficiente o si se prefiere reforzar fondos propios.

### Compromiso de respuesta rápida

Los socios se comprometen a decidir y, en su caso, transferir los fondos en un plazo máximo de **15 días naturales** desde la activación del nivel **Rojo** o **Naranja avanzado**.

---

## 5. Medidas de contención de gastos (orden de aplicación)

1. Reducción de marketing digital al mínimo técnico.
2. Aplazamiento de cualquier inversión o mejora no crítica.
3. Negociación de aplazamientos con proveedores y gestoría.
4. Revisión de suscripciones SaaS (eliminar las no esenciales).
5. Reducción temporal del retén de mantenimiento técnico (si es viable sin poner en riesgo la plataforma).
6. En último caso, valorar reducción temporal de actividad de la tienda física si genera más coste que beneficio.

---

## 6. Seguimiento y gobierno

| Concepto | Definición |
|----------|------------|
| Responsable de tesorería | Administrador / Socio 1 |
| Nivel Verde | Revisión **mensual** |
| Nivel Amarillo | Revisión **quincenal** |
| Nivel Naranja y Rojo | Revisión **semanal** |

**Información mínima a reportar a los socios:**

- Saldo de caja  
- Previsión de cobros y pagos a 30/60/90 días  
- Estado del expediente de justificación de la subvención  
- Desviaciones respecto al presupuesto  

---

## 7. Cláusula recomendada para el Pacto de Socios (resumen)

Los socios acuerdan establecer un **Plan de Contingencia de Tesorería**.

- Cuando la caja disponible descienda por debajo de **8.000 €**, el Administrador activará medidas de contención.
- Cuando descienda por debajo de **5.000 €**, o cuando el cobro de la subvención se retrase más de **4 meses** respecto al calendario previsto, se activará el mecanismo de apoyo de socios mediante préstamo participativo o aportación de capital, en proporción a su participación o según acuerdo específico, con el compromiso de responder en un plazo máximo de **15 días naturales**.

---

## Implementación en plataforma

| Constante / función | Uso |
|---------------------|-----|
| `CASH_ALERT_LEVELS` | Tabla §2 |
| `resolveCashAlertLevel(cash)` | Nivel actual según caja simulada |
| `CASH_SAFETY_FLOOR` | Colchón mínimo 7.000 € |
| `CONTINGENCY_SCENARIOS` | Escenarios A/B/C |
| `PARTNER_SUPPORT_MECHANISMS` | §4 |
| `COST_CONTAINMENT_STEPS` | §5 |
| `CONTINGENCY_GOVERNANCE` | §6 |
| `PARTNER_PACT_CLAUSE_SUMMARY` | §7 |
