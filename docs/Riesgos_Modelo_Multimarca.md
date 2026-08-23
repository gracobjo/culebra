# Riesgos del modelo multimarca

![Logo Sabores de la Culebra](./imagenes/logo.png)

**Marketplace Sabores de la Culebra – Villardeciervos**

Mapa de riesgos operativos y comerciales del modelo multiproductor. Mitigaciones alineadas con [`Flujo_Operativo_Piloto.md`](./Flujo_Operativo_Piloto.md) y [`Posicionamiento_Activador_Territorio.md`](./Posicionamiento_Activador_Territorio.md).

**Medición en admin:** `/admin/kpis` (bloque *Riesgos del modelo*). Código: `apps/web/src/lib/admin-risk-metrics.ts`.

---

## 1. Multi-homing

| Dimensión | Evaluación |
|-----------|------------|
| Probabilidad | Alta |
| Impacto | Medio (alto si se concentran los mejores) |
| Momento crítico | Desde el primer año |

**Regla práctica:** no pedir exclusividad; competir por comodidad + consolidación + showroom + rappels.

Mitigaciones: canal complementario, un solo envío, showroom, rappels, fichas/fotos, seguimiento piloto, exclusividad solo en lotes/campañas puntuales.

---

## 2. Incumplimiento de SLA

| Dimensión | Evaluación |
|-----------|------------|
| Probabilidad | Media-Alta en piloto; Media después |
| Impacto | **Alto** (reputación de toda la plataforma) |
| Momento crítico | Primeros 6–12 meses |

SLA canónico: 24 h preparación, 4 h stock, cut-off 13:00 ([`Legal_NDA_Acuerdo_Confidencialidad.md`](./Legal_NDA_Acuerdo_Confidencialidad.md) DOC-02).

**Alerta:** > **10–15 %** de subpedidos con retraso o incidencia en un mes → `/admin/kpis`.

Escalado: 1º aviso → 2º suspensión temporal de fichas → 3º baja.

---

## 3. Dependencia de pocos productores

| Dimensión | Evaluación |
|-----------|------------|
| Probabilidad | Alta (12–18 meses) |
| Impacto | **Alto** |
| Momento crítico | Año 1 y principio Año 2 |

**Metas:** 12–15 productores activos a 18 meses; ningún productor > **~25–30 %** del GMV.

**Alerta:** top 3 concentran > **65–70 %** del GMV más de un trimestre → `/admin/kpis`.

---

## 4. Riesgos colaterales

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Calidad heterogénea | Media | Alto | Criterios de entrada + control trastienda |
| Rotura de stock no avisada | Media | Alto | SLA 4 h; stock mínimo solo con fiables |
| Devoluciones / desistimiento | Media | Medio | Protocolo en contrato |
| Sobrecarga Socio 2 | Media | Alto | Piloto 1–5 pedidos/día |
| Dependencia comodato | Media | Alto | Contrato + plan B ubicación |
| Retraso subvención | Media-Alta | Alto | [`Plan_Contingencia_Tesoreria.md`](./Plan_Contingencia_Tesoreria.md) |

---

## 5. Mapa de calor (prioridad)

| Riesgo | Prioridad mitigación |
|--------|----------------------|
| Incumplimiento de SLA | **Máxima** |
| Dependencia de pocos productores | **Máxima** |
| Multi-homing | Media-Alta |
| Calidad / sobrecarga / subvención | Alta |

---

## 6. Mediciones mensuales (admin)

| Métrica | Umbral alerta | Umbral crítico |
|---------|---------------|----------------|
| % subpedidos con incidencia (mes) | > 10 % | > 15 % |
| Concentración GMV top 3 (mes) | > 65 % | > 70 % |
| Máx. GMV un productor (mes) | > 25 % | > 30 % |
| Productores con venta (90 d) | < 5 (piloto) | < 3 |
| % pedidos multiproductor | Informativo (ventaja consolidación) | — |

También se mantienen KPIs por artesano: preparación &lt;24 h, roturas, embalaje, valoraciones.

---

## 7. Recomendaciones prioritarias

1. Aceptar multi-homing; no pelear exclusividad al inicio.  
2. Proteger reputación con SLA escrito + control trastienda.  
3. Diversificar productores desde mes 4–6.  
4. Mantener piloto pequeño (5) hasta SLA rodado.  
5. Medir cada mes en `/admin/kpis`: incidencias, concentración GMV, activos.
