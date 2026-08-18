# Catalogo y productos

## Estado

FASE 5 completada: catalogo publico, fichas de producto, variantes, busqueda/filtros y moderacion.

## Estados de producto

- `DRAFT` — borrador del productor
- `PENDING_REVIEW` — enviado a revision
- `PUBLISHED` — visible en catalogo
- `REJECTED` — rechazado (con motivo)
- `DISABLED` — desactivado por el productor o admin

Solo se publican productos de proveedores `ACTIVE`.

## Regla de contenido

No se afirma denominacion de origen, certificacion o premio si el productor no lo documenta. El campo `origin` es opcional y se muestra solo si existe.

## Variantes

Un producto puede tener formatos:

- Queso curado: 250 g / 500 g / 1 kg
- Jamon: 5 kg / 7 kg / 10 kg

El stock se controla por variante cuando existen.

## Busqueda y filtros

- nombre, productor, localidad, descripcion
- categoria / subcategoria
- rango de precio
- disponibilidad

## URLs

- `/productos`
- `/productos/[slug]`
- `/categorias`
- `/categorias/[slug]`
- `/panel/proveedor/productos`

## Siguiente fase

FASE 7: seguimiento de pedidos.
