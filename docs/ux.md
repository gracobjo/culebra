# UX y conversion

![Logo Sabores de la Culebra](./imagenes/logo.png)


## Estado

FASE 12 completada: experiencia publica orientada a confianza, navegacion clara y conversion.

## Mejoras principales

### Confianza
- Franja de ventajas (`TrustStrip`) en home, ficha de producto y `/como-funciona`.
- Mensajes claros sobre origen, pago Stripe y envio por productor.
- Footer ampliado con enlaces de ayuda.

### Navegacion
- Hub `/tienda` (agro + turismo rural + packs) como entrada de catalogo.
- Migas de pan (`Breadcrumbs`) en tienda, catalogo, producto, productores, alojamientos y packs.
- Cabecera: Tienda · Productos · Productores (alojamientos/packs desde el hub).
- Pagina `/como-funciona` con flujo de compra explicado.

### Fichas y catalogo
- `ProductCard` con badges de agotado/oferta y hover mejorado.
- Ficha de producto con panel de compra, secciones agrupadas, alergenos y cross-sell de alojamientos.
- Catalogo con contador de resultados y empty states accionables hacia `/tienda`.

### SEO
- Metadata con plantilla de titulo y Open Graph en layout.
- JSON-LD de organizacion (home) y producto (ficha).

### Accesibilidad y estilo
- Tipografia system-ui, antialiasing y `:focus-visible` global.

## Rutas publicas nuevas o mejoradas

| Ruta | Proposito |
|------|-----------|
| `/tienda` | Hub “Tienda de la comarca” |
| `/alojamientos` | Directorio territorial (reserva externa) |
| `/packs` | Packs noche + lote (noche fuera del checkout) |
| `/como-funciona` | Explicacion del flujo de compra |
| `/` | Hero, confianza, preview de tienda, destacados y productores |

## Siguiente fase

FASE 15: testing automatizado.
