# Modelos de comisiones — Sabores de la Culebra

Visión consolidada de **todas** las comisiones del sistema: ingreso principal (productor), coste comercial (canales externos) y margen neto de la S.L.

Documentos relacionados:

- [`commissions.md`](./commissions.md) — reglas técnicas, rappels, checkout, liquidaciones
- [`Programa_Afiliados_Sabores_Culebra.md`](./Programa_Afiliados_Sabores_Culebra.md) — operativa de afiliados
- [`Showroom_Ingresos_Cestas.md`](./Showroom_Ingresos_Cestas.md) — packaging y PVP de cestas

Código de referencia: `packages/domain/src/commission-stack.ts` (`calculateStackedCommission`).

---

## 1. Comisión al productor (ingreso principal de la S.L.)

| Tarifa | Comisión S.L. | Qué recibe el productor | Cuándo se aplica |
|--------|---------------|-------------------------|------------------|
| **Bronce** | 17 % | 83 % | Tarifa de entrada / volumen bajo |
| **Plata** | 14 % | 86 % | Volumen medio (rappel) |
| **Oro** | 12 % | 88 % | Volumen alto (rappel) |
| **Mínimo por subpedido** | 4 € | — | Si el 17 / 14 / 12 % no llega a 4 € |

Durante el año se cobra la tarifa vigente (normalmente 17 %); el rappel se liquida al cierre del año natural. Ver [`commissions.md`](./commissions.md) § Rappels.

**Regla de oro:** la comisión al productor **nunca baja del 12 %** (Oro) en el esquema estándar.

---

## 2. Comisión a canales externos (coste comercial)

| Canal | Comisión que cede la S.L. | Base de cálculo | Notas |
|-------|---------------------------|-----------------|-------|
| Alojamiento rural | 10 % | PVP cesta / productos | Ya definido con hosteleros |
| Afiliado (blog, guía, embajador…) | 8–10 % | PVP productos (sin portes) | Según tipo en `/admin/afiliados` |
| Productor como afiliado | 8–10 % | Solo ventas de **otros** productores | No sobre las suyas |

**Regla de oro:** la comisión a canales externos **no supera el 10 %**.

El ledger de afiliados registra lo que se debe al canal; el checkout aplica el descuento de canal **antes** de calcular la comisión al productor (ver §3).

---

## 3. Cómo se combinan (orden de cálculo)

Cuando hay canal externo (alojamiento o afiliado):

1. Se parte del **PVP** (productos, sin portes).
2. Se descuenta la **comisión del canal** (8–10 %).
3. Sobre el **resto** se aplica la comisión al productor (17 / 14 / 12 %), con suelo 4 € por subpedido.
4. La S.L. se queda su comisión **menos costes directos** (packaging, etc.).

El **porte (6,50 €)** lo paga siempre el cliente y **no entra** en el reparto.

### Ejemplo — Cesta Comarca 45 €

(Productor Bronce 17 % + alojamiento 10 %)

| Concepto | Importe |
|----------|---------|
| PVP | 45,00 € |
| Comisión alojamiento 10 % | −4,50 € |
| Base para productor | 40,50 € |
| Comisión S.L. 17 % | 6,89 € |
| Productor | 33,61 € |
| Packaging (aprox.) | −2,40 € |
| **Margen neto S.L.** | **≈ 4,49 €** |

Verificación: 4,50 + 6,89 + 33,61 = 45,00 €.

---

## 4. Tabla de decisión rápida (margen S.L. con canal externo 10 %)

Packaging orientativo ~5,3 % del PVP (validar en [`Showroom_Ingresos_Cestas.md`](./Showroom_Ingresos_Cestas.md)).

| Cesta | Bronce 17 % | Plata 14 % | Oro 12 % |
|-------|-------------|------------|----------|
| Escapada 29 € | ✅ 2,64 € | ⚠️ 1,85 € | ❌ 1,33 € |
| Comarca 45 € | ✅ 4,49 € | ✅ 3,27 € | ⚠️ 2,46 € |
| Sierra 65 € | ✅ 6,75 € | ✅ 5,00 € | ⚠️ 3,82 € |
| Reserva 89 € | ✅ 9,12 € | ✅ 6,72 € | ⚠️ 5,11 € |

| Símbolo | Significado |
|---------|-------------|
| ✅ | Aceptar |
| ⚠️ | Solo con volumen |
| ❌ | Evitar |

**Implicación comercial:** priorizar venta por canales externos en productos/cestas de productores en tarifa **Bronce (17 %)**.

---

## 5. Resumen según canal

| Situación | Comisión productor | Comisión canal | Margen S.L. |
|-----------|-------------------|----------------|-------------|
| Venta directa showroom / online | 17 / 14 / 12 % | 0 % | **Máximo** |
| Venta vía alojamiento | 17 / 14 / 12 % sobre base neta | 10 % | Medio |
| Venta vía afiliado | 17 / 14 / 12 % sobre base neta | 8–10 % | Medio |
| Showroom producto suelto | 17 / 14 / 12 % | 0 % | Alto |

---

## 6. Reglas de oro (checklist)

1. Comisión al productor: mínimo **12 %** (Oro) en modelo estándar.
2. Comisión canal externo: máximo **10 %**.
3. Priorizar canales externos con productores **Bronce (17 %)**.
4. Porte **6,50 €**: siempre a cargo del cliente, fuera del reparto.
5. Mínimo **4 €** por subpedido de productor protege margen en tickets pequeños.
6. Productor-afiliado: comisión solo sobre ventas de **otros** productores.

---

## 7. Implementación en checkout

En `packages/auth/src/checkout.service.ts`:

- Si el pedido lleva `affiliateCode` activo, se resta el % del afiliado del bruto de cada línea **elegible** antes de `resolveLineCommission`.
- Líneas del propio productor afiliado quedan excluidas del descuento de canal.
- El ledger en `/admin/afiliados` sigue registrando el % acordado sobre PVP para el pago al afiliado.

Simulador en admin: panel **Afiliados** → sección «Simulador de margen».

---

## 8. API de simulación

```typescript
import {
  calculateStackedCommission,
  referenceBasketMarginTable,
  PRODUCER_TIER_COMMISSION_PERCENT,
} from "@culebra/domain";

const ejemplo = calculateStackedCommission({
  pvp: 45,
  producerCommissionPct: 17,
  channelCommissionPct: 10,
  packagingCost: 2.4,
});
// ejemplo.slNetMargin ≈ 4.49

const tabla = referenceBasketMarginTable({ channelCommissionPct: 10 });
```
