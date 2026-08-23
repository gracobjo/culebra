# Catalogo y productos

![Logo Sabores de la Culebra](./imagenes/logo.png)


## Estado

FASE 5 completada: catalogo publico, fichas de producto, variantes, busqueda/filtros y moderacion.

Extension territorial (fases 2–3): hub `/tienda`, directorio de alojamientos, packs, cupones y afiliacion — **sin** integrar la noche en el checkout agroalimentario.

## Estados de producto

- `DRAFT` — borrador del productor
- `PENDING_REVIEW` — enviado a revision
- `PUBLISHED` — visible en catalogo
- `REJECTED` — rechazado (con motivo)
- `DISABLED` — desactivado por el productor o admin

Solo se publican productos de proveedores `ACTIVE`.

## Hub `/tienda`

Punto de entrada “Tienda de la comarca”:

| Bloque | Destino | Checkout |
|--------|---------|----------|
| Categorias agro | `/categorias/[slug]` → productos | Si (carrito marketplace) |
| Turismo rural | `/alojamientos` | No (reserva externa) |
| Packs | `/packs` | Solo el **lote** de productos; noche externa |

`/categorias` (indice) redirige a `/tienda`. Las fichas `/categorias/[slug]` se mantienen.

## Regla de contenido

No se afirma denominacion de origen, certificacion o premio si el productor no lo documenta. El campo `origin` es opcional y se muestra solo si existe.

## Conservación y consumo preferente (La Raya)

El arranque prioriza productos **sin refrigeración**, pero varias familias tienen ventana corta de consumo preferente (repostería seca 30–60 días; loncheados 60–90; harina de castaña / mermelada baja en azúcar ~90).

Guía completa, tabla y **SLA por familia**: [`Catalogo_Productos_La_Raya_Conservacion.md`](./Catalogo_Productos_La_Raya_Conservacion.md).  
Productores objetivo embutidos/caza: [`Productores_Objetivo_Embutidos_Caza_Culebra.md`](./Productores_Objetivo_Embutidos_Caza_Culebra.md).

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

## Cross-sell territorio

- Producto → alojamientos relacionados (“Si vienes a la sierra…”).
- Alojamiento → productos vinculados (“Si te alojaste aqui…”).

## URLs

- `/tienda`
- `/productos`
- `/productos/[slug]`
- `/categorias/[slug]`
- `/alojamientos`, `/alojamientos/[slug]`
- `/packs`, `/packs/[slug]`
- `/panel/proveedor/productos`
- `/admin/turismo`

Detalle de modelos y servicios: [tourism.md](./tourism.md).
