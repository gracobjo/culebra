# Comisiones y liquidaciones

## Estado

FASE 10 completada: reglas de comision versionadas, snapshot en el pedido y liquidaciones al productor.

## Principios

- Las reglas no se editan: cada cambio crea una version nueva.
- `validTo` cierra la version anterior; los pedidos ya creados no cambian.
- El importe aplicado se guarda en `OrderItem`, `VendorOrder` y `Payout`.

## Resolucion de comision (checkout)

Por linea, en este orden:

1. Regla `CATEGORY` vigente (subcategoria o categoria del producto).
2. Regla `PERCENTAGE` vigente del productor.
3. Porcentaje del contrato activo (si existe).
4. `0%` por defecto.

Ademas, una regla `FIXED` vigente suma una cuota por subpedido del productor. El neto nunca es negativo.

## Alta de reglas (admin)

`POST /admin/vendors/:vendorId/commission-rules`

```json
{ "ruleType": "PERCENTAGE", "percentage": 12, "notes": "Tarifa estandar" }
```

Tipos: `PERCENTAGE`, `FIXED`, `CATEGORY` (requiere `categoryId` y `percentage`).

Al aceptar un contrato con `commissionPercent`, si no hay una regla equivalente se crea una version `PERCENTAGE`.

## Liquidaciones

Cuando el pedido se marca pagado:

1. Se crea un `Payout` por `VendorOrder` con bruto, comision y neto.
2. Si el productor tiene Stripe Connect con cobros activos, se transfiere el neto.
3. Si no, el payout queda `PENDING` y se puede reintentar despues.

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

`/panel/proveedor/liquidaciones` — reglas vigentes, historial y reintento de transferencias.

## Siguiente fase

FASE 12: UX/UI del marketplace.
