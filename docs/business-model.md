# Modelo de negocio

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)


## Base

Marketplace multi-vendedor sin compra inicial de stock por parte de la plataforma.

## Ingresos

- comision por venta: **15 % por defecto**, ajustable por productor (reglas versionadas, categoria o cuota fija)
- cargo de envio al cliente cuando el pedido (tras descuento) es **&lt; 49 €**: **4,95 €**
- futuras tarifas especiales o promocionales

## Logistica / envio gratuito

Umbral: a partir de **49 €** de merchandise el envio es **gratis** para el cliente. El coste interno de etiqueta (~**5 €**) lo absorbe el marketplace desde su margen de comision; el productor conserva el **85 %** integro sobre el producto.

Ver `docs/cart.md` y `packages/auth/src/shipping.service.ts`.

Los importes se congelan en el pedido. Ver `docs/commissions.md`.

## Restriccion operativa

El proveedor conserva la responsabilidad sobre producto, stock, preparacion, envio y cumplimiento normativo.
