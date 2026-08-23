# Modelo de negocio

![Logo Sabores de la Culebra](./imagenes/logo.png)


## Base

Marketplace multi-vendedor sin compra inicial de stock por parte de la plataforma.

## Ingresos

- comision por venta: **17 % por defecto** (minimo **4 €** por subpedido de productor), ajustable por productor (reglas versionadas, categoria o cuota fija)
- cargo de envio al cliente: **tarifa plana 6,50 €** (siempre; sin envio gratis)
- futuras tarifas especiales o promocionales

**Por que 17 % y no 15 %:** el 17 % mejora el margen por pedido (+1,24 € a ticket 62 €), baja el break-even ~1.200 € GMV/mes y reduce perdidas acumuladas a 3 años en ~5.240 €, con impacto moderado al productor (−2 pp, mitigado con rappels). Detalle: [`Comparativa_Comision_15_vs_17.md`](./Comparativa_Comision_15_vs_17.md).

## Logistica / envio

El cliente paga **siempre 6,50 €**. La S.L. no absorbe portes. El productor recibe su neto sobre el producto (83 % si comision 17 %, o el complemento tras el minimo 4 €).

Ver `docs/cart.md` y `packages/auth/src/shipping.service.ts`.

Los importes se congelan en el pedido. Ver `docs/commissions.md`.

## Restriccion operativa

El proveedor conserva la responsabilidad sobre producto, stock, preparacion, envio y cumplimiento normativo.
