# Flujo operativo del piloto

![Logo Sabores de la Culebra](./imagenes/logo.png)

**Marketplace Sabores de la Culebra – Villardeciervos**

**Objetivo del piloto:** validar el circuito completo con **5 productores** y volumen bajo (orientativo: **1–5 pedidos/día**), sin romper el modelo (**sin compra de stock**, comisión base **17 %**, porte **6,50 €** al cliente).

**Referencias:** [`Flujo_Operativo_Piloto.md`](./Flujo_Operativo_Piloto.md) · [`Riesgos_Modelo_Multimarca.md`](./Riesgos_Modelo_Multimarca.md) · [`Posicionamiento_Activador_Territorio.md`](./Posicionamiento_Activador_Territorio.md) · [`Argumentario_Captacion_Productores.md`](./Argumentario_Captacion_Productores.md) · [`Catalogo_Productos_La_Raya_Conservacion.md`](./Catalogo_Productos_La_Raya_Conservacion.md) · [`Concepto_Tienda_Showroom_Villardeciervos.md`](./Concepto_Tienda_Showroom_Villardeciervos.md) · [`tourism.md`](./tourism.md) · [`commissions.md`](./commissions.md) · [`Clausula_Comision_Rappels_Productor.md`](./Clausula_Comision_Rappels_Productor.md) · [`Legal_NDA_Acuerdo_Confidencialidad.md`](./Legal_NDA_Acuerdo_Confidencialidad.md) DOC-02 · [`Dossier_Socios_Marketplace_Villardeciervos.md`](./Dossier_Socios_Marketplace_Villardeciervos.md) §5–§7 y §14 · panel `/admin/piloto` · `/admin/kpis`

---

## Decisiones cerradas del piloto

| Tema | Decisión |
|------|----------|
| **Modalidad por defecto** | Oferta estándar = **C (híbrida)**. Arranque real = **A** hasta primera rotación. **B** solo con rotación demostrada |
| **SLA por familia** | **Sí:** mínimos al envío **30 / 60 / ≥90** (+ quesos **45**) — tabla en catálogo §6 |
| **Trastienda** | **Socio 2 (RETA)**; dimensionado para **1–5 pedidos/día** (+ apoyo puntual Socio 1) |
| **Packs turismo** | Se vende el **lote gourmet** (carrito + 17 %). Alojamiento/experiencia = **enlace externo** (sin asumir reserva) |
| **Venta física showroom** | **Misma comisión 17 %** (mín. 4 €) vía tablet/pedido en sistema; si no hay TPV: solo **exposición + QR a web** |
| **Rappels** | Activos desde **año 1** del modelo estándar (cobro 17 % en el año; liquidación al cierre). **Fundadores piloto:** **12 % fijo el primer año** (sin rappel que baje más ese año) |

---

## 1. Visión general del flujo

```text
Productor → Alta + depósito/preparación
     ↓
Cliente compra en la web (varios productores posibles)
     ↓
Pago (Stripe) → retención 14 días
     ↓
Notificación a productores + trastienda
     ↓
Preparación (productor y/o trastienda)
     ↓
Consolidación en Villardeciervos
     ↓
Etiquetado + recogida transportista
     ↓
Envío al cliente (paga 6,50 €)
     ↓
Liquidación al productor (tras 14 días)
```

---

## 2. Fase 0 – Alta del productor (antes del primer pedido)

| Paso | Quién | Qué se hace |
|------|-------|-------------|
| 0.1 | Equipo | Visita al obrador / acuerdo verbal de prueba |
| 0.2 | Productor + S.L. | Firma del Contrato de Adhesión (comisión acordada, mín. 4 €, rappels o excepción fundadores, SLA, baja) |
| 0.3 | Equipo | Alta en el panel: datos fiscales, IBAN / Stripe Connect, contacto |
| 0.4 | Equipo + productor | Subida de **2–4 fichas** (fotos, descripción, precio, stock inicial) |
| 0.5 | Productor | Elige modalidad **A / B / C** (por defecto del piloto: ver §3) |
| 0.6 | Equipo | Colocación en showroom (si aplica) y activación en la web |

**Resultado:** el productor aparece en el catálogo y puede recibir pedidos.

---

## 3. Modalidades de trabajo (piloto)

| Modalidad | Cómo funciona | Recomendada para |
|-----------|---------------|------------------|
| **A. Escaparate + bajo pedido** | Exposición en showroom. Al llegar un pedido, el productor prepara y lleva a Villardeciervos en **24 h** | Poco volumen o muy cerca |
| **B. Stock mínimo en trastienda** | Deja **4–12 unidades** de 2–3 referencias; la trastienda prepara | Confianza + producto estable + rotación demostrada |
| **C. Híbrida** | Stock mínimo de lo que más rota + resto bajo pedido | **Oferta estándar** del piloto |

**Regla del piloto:** empezar casi todos en **A** (o **C** con stock muy bajo). Pasar a **B** solo cuando haya rotación.

Equivalencia con argumentario §4: A ≈ escaparate + consolidación bajo pedido · B ≈ stock mínimo / depósito · C ≈ híbrido.

---

## 4. Flujo cuando el cliente compra

| Paso | Momento | Qué ocurre |
|------|---------|------------|
| 4.1 | Checkout | Paga productos + **6,50 €** de envío |
| 4.2 | Stripe | Confirma pago; se crea el pedido; liquidación bloqueada **14 días** |
| 4.3 | Sistema | Notifica a cada productor (email + panel; WhatsApp solo si se acuerda como soporte) |
| 4.4 | Sistema / ops | La trastienda ve el pedido consolidado (panel admin / Telegram ops) |
| 4.5 | Productor | Según A/B/C: prepara y lleva, o confirma stock en trastienda |
| 4.6 | SLA | Preparación en **24 h** desde notificación; cut-off **13:00** → intentar mismo día |

---

## 5. Flujo en la trastienda (Villardeciervos)

**Responsable operativo:** Socio 2 (RETA), con apoyo puntual si hace falta.

1. **Recepción** — Producto ya envasado y con etiqueta sanitaria del artesano; precinto / estado.  
2. **Cotejo** — Referencia y cantidad vs pedido.  
3. **Picking + consolidación** — Una sola caja (S/M/L) + acolchado.  
4. **Cierre y etiquetado** — Precinto + etiqueta de envío (impresora del kit logístico).  
5. **Recogida** — Transportista (Correos, SEUR u otro).

**Importante:** la S.L. **no abre** el producto del artesano. Solo consolida y embala la caja exterior.

---

## 6. Envío y postventa

| Concepto | Regla del piloto |
|----------|------------------|
| Coste del envío | Cliente paga siempre **6,50 €** |
| Quién genera la etiqueta | Trastienda (kit logístico) |
| Seguimiento | Tracking desde web / email |
| Incidencias de transporte | S.L. con el transportista |
| Devolución / desistimiento | Normativa **14 días**; se gestiona con el productor |

---

## 7. Liquidación al productor

| Momento | Qué ocurre |
|---------|------------|
| Día 0 | Cliente paga |
| Días 1–14 | Retención legal (desistimiento) |
| Día 15 (aprox.) | Payout vía Stripe Connect |
| Cálculo estándar | Precio − **17 %** (o mín. **4 €** si es mayor) |
| Fundadores piloto (año 1) | **12 %** fijo (acordado en alta / panel) |
| Rappels | Cierre de **año natural**; no en cada pedido |

---

## 8. Roles en el piloto

| Rol | Persona | Responsabilidades |
|-----|---------|-------------------|
| Dirección / admin | Socio 1 | Altas, contratos, incidencias graves, ayudas |
| Operaciones / trastienda | Socio 2 (RETA) | Recepción, consolidación, etiquetado, showroom, contacto diario |
| Tecnología | Socio 3 / desarrollo | Panel, notificaciones, incidencias técnicas |
| Productor | Artesano | Stock/preparación según modalidad, calidad, SLA |

---

## 9. SLA resumido

| Concepto | Objetivo |
|----------|----------|
| Actualización de stock tras rotura | **4 horas** |
| Preparación del pedido | **24 horas** desde notificación |
| Cut-off | Pedidos antes de **13:00** → intentar mismo día |
| Entrega en trastienda (si aplica) | Dentro del plazo de preparación |
| Consumo preferente restante al envío | Por familia: ver §10 |
| Respuesta a incidencias del productor | Mismo día laboral |

Incumplimientos reiterados → aviso → suspensión temporal de la ficha.

---

## 10. SLA por familia (consumo preferente restante al envío)

Canónico en [`Catalogo_Productos_La_Raya_Conservacion.md`](./Catalogo_Productos_La_Raya_Conservacion.md) §6:

| Familia | Mínimo restante |
|---------|----------------:|
| Repostería seca | **30 días** (ideal 45) |
| Loncheados / tacos | **60 días** |
| Embutido pieza / miel / vino / legumbres | **≥ 90 días** |
| Quesos curados | **45 días** |
| Harina castaña / mermelada baja azúcar | **60 días** (objetivo 90) |

Mensaje comercial: categoría *ventana corta / consumo de temporada*. Operativa: **esta tabla**, no un único “90 días”.

---

## 11. Showroom, turismo y comisión física

| Canal | Regla |
|-------|--------|
| Venta online | 17 % (+ mín. 4 €) o 12 % fundadores año 1 |
| Venta física showroom | **Misma** comisión; pedido registrado en sistema (tablet) |
| Sin TPV listo | Solo escaparate + **QR a web** (sin caja paralela) |
| Pack turismo | Lote gourmet en carrito; noche/experiencia por **enlace** ([`tourism.md`](./tourism.md)) |

---

## 12. Rappels vs fundadores

| Productor | Durante el año | Al cierre del año |
|-----------|----------------|-------------------|
| **Estándar** | Se cobra **17 %** | Si supera umbrales → rappel a **14 %** / **12 %** efectivo (retroactivo) |
| **Fundador piloto (año 1)** | **12 %** fijo | Sin rappel adicional a la baja ese año |
| **Año 2+** | Todos al esquema estándar 17 % + rappels | Según tramos Bronce / Plata / Oro |

Tramos: [`commissions.md`](./commissions.md) · [`Clausula_Comision_Rappels_Productor.md`](./Clausula_Comision_Rappels_Productor.md).

---

## 13. Indicadores mínimos (90 días)

Medición operativa en **`/admin/kpis`** (bloque riesgos + KPIs por artesano). Detalle de umbrales: [`Riesgos_Modelo_Multimarca.md`](./Riesgos_Modelo_Multimarca.md).

- Nº de pedidos totales y por productor  
- **% de pedidos multiproductor** (consolidación real)  
- Tiempo medio / % cumplimiento SLA **24 h**  
- **% subpedidos con incidencia** (alerta &gt;10–15 %)  
- **Concentración GMV** (top 3 y máx. por productor)  
- Nº de productores activos (venta en 90 d)  
- Feedback cualitativo productores y clientes  

---

## 14. Regla de oro

> Empezar **simple y reversible**. Preferir **bajo pedido + entrega en Villardeciervos** antes que stock muerto. Solo aumentar depósito cuando haya **rotación demostrada**.
