# Comisiones y liquidaciones

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)


## Estado

FASE 10 completada: reglas de comision versionadas, snapshot en el pedido y liquidaciones al productor.

Comision por defecto de la plataforma: **17%** (`DEFAULT_MARKETPLACE_COMMISSION_PERCENT` en `@culebra/domain`), con suelo de **4 €** por subpedido (`DEFAULT_MIN_COMMISSION_EUR` en `finalizeVendorCommission`).

## Principios

- Las reglas no se editan: cada cambio crea una version nueva.
- `validTo` cierra la version anterior; los pedidos ya creados no cambian.
- El importe aplicado se guarda en `OrderItem`, `VendorOrder` y `Payout`.
- El admin puede **subir o bajar** el porcentaje por productor (0–100 %). Solo afecta a pedidos futuros.

## Resolucion de comision (checkout)

Por linea, en este orden:

1. Regla `CATEGORY` vigente (subcategoria o categoria del producto).
2. Regla `PERCENTAGE` vigente del productor.
3. Porcentaje del contrato activo (si existe).
4. **17% por defecto** de la plataforma (`source: DEFAULT`).

Ademas, una regla `FIXED` vigente suma una cuota por subpedido del productor. Tras sumar lineas + fijo se aplica el **minimo 4 €** (sin superar el bruto). El neto nunca es negativo.

### Ejemplo (producto 100 €, sin reglas ni contrato)

| Concepto | Importe |
|----------|---------|
| Bruto productor | 100,00 € |
| Comision marketplace (17 %) | −17,00 € |
| Neto al productor | 83,00 € |

### Ejemplo (producto 20 € — activa el minimo)

| Concepto | Importe |
|----------|---------|
| Bruto productor | 20,00 € |
| 17 % | 3,40 € |
| Comision aplicada (min. 4 €) | −4,00 € |
| Neto al productor | 16,00 € |

## Alta automatica al aprobar productor

Cuando el admin aprueba un productor (`ACTIVE` en `/admin/productores/:id`), si no tiene regla `PERCENTAGE` activa se crea una version al **17%** con nota *"Comision por defecto de la plataforma"*.

El seed de desarrollo tambien crea esa regla para los productores de prueba.

## Modificar comision (admin)

**Panel web:** `/admin/productores/:id` → seccion **Comision**.

1. Introduce el nuevo porcentaje (ej. 10 %, 15 %, 20 %).
2. Pulsa **Actualizar comision (%)**.
3. Se crea una nueva version `PERCENTAGE`; la anterior queda cerrada con `validTo`.

La ficha muestra la **comision efectiva** actual (regla, contrato o 17 % por defecto).

**API:** `POST /admin/vendors/:vendorId/commission-rules`

```json
{ "ruleType": "PERCENTAGE", "percentage": 12, "notes": "Tarifa reducida temporal" }
```

Tipos adicionales: `FIXED` (cuota fija por pedido), `CATEGORY` (requiere `categoryId` y `percentage`).

## Contratos y comision

- Las versiones de contrato nuevas llevan **17%** si el admin no indica otro valor en `commissionPercent`.
- Al firmar el contrato, si el porcentaje difiere de la regla vigente, se sincroniza una regla `PERCENTAGE`.
- Prioridad en checkout: reglas explicitas **antes** que contrato; contrato **antes** que 17 % por defecto.

Ver `docs/contracts.md`.

## Vista del productor

`/panel/proveedor/liquidaciones`:

- Muestra la **comision aplicada en pedidos nuevos** (porcentaje efectivo).
- Lista reglas vigentes (si las hay).
- Historial de payouts y boton de reintento.

Si no hay regla personalizada, se indica que aplica el 17 % por defecto del marketplace.

## Liquidaciones (payout)

Cuando el pedido se marca pagado:

1. Se crea un `Payout` por `VendorOrder` con bruto, comision y neto.
2. Tras **14 dias** de retencion (derecho de desistimiento), el cron libera el payout.
3. Segun el metodo del productor (`/panel/proveedor/pagos`):
   - **Stripe Connect** → `stripe.transfers.create`
   - **PayPal** → PayPal Payouts API al email configurado
4. Si el productor no ha completado el alta, el payout queda `PENDING` y se reintenta desde liquidaciones.

Ver `docs/payments.md` para Stripe Connect v2 y PayPal.

## Codigo relevante

| Archivo | Funcion |
|---------|---------|
| `packages/domain/src/index.ts` | `DEFAULT_MARKETPLACE_COMMISSION_PERCENT = 17` |
| `packages/auth/src/commission.service.ts` | `resolveLineCommission`, `getEffectiveCommissionPercent`, `ensureDefaultCommissionRuleForVendor`, `setVendorCommissionPercentForAdmin` |
| `packages/auth/src/vendor-payout.service.ts` | Ejecucion de payout Stripe / PayPal |
| `apps/web/src/app/admin/actions.ts` | Aprobacion productor + regla 17 % |

## API

| Metodo | Ruta | Rol |
|--------|------|-----|
| GET | `/vendors/me/commission-rules` | VENDOR |
| GET | `/vendors/me/payouts` | VENDOR |
| POST | `/vendors/me/payouts/retry` | VENDOR |
| GET | `/admin/vendors/:vendorId/commission-rules` | ADMIN |
| POST | `/admin/vendors/:vendorId/commission-rules` | ADMIN |
| GET | `/admin/payouts` | ADMIN |

## Web

| Ruta | Funcion |
|------|---------|
| `/panel/proveedor/liquidaciones` | Comision efectiva, reglas, historial, reintento |
| `/panel/proveedor/pagos` | Metodo de cobro (Stripe / PayPal) |
| `/admin/productores/:id` | Ajustar comision por productor |

## Siguiente fase

FASE 12: UX/UI del marketplace.
