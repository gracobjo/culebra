# UX y conversion

## Estado

FASE 12 completada: experiencia publica orientada a confianza, navegacion clara y conversion.

## Mejoras principales

### Confianza
- Franja de ventajas (`TrustStrip`) en home, ficha de producto y `/como-funciona`.
- Mensajes claros sobre origen, pago Stripe y envio por productor.
- Footer ampliado con enlaces de ayuda.

### Navegacion
- Migas de pan (`Breadcrumbs`) en catalogo, producto, productores y categorias.
- Tarjetas de categoria y productor con mejor jerarquia visual.
- Pagina `/como-funciona` con flujo de compra explicado.

### Fichas y catalogo
- `ProductCard` con badges de agotado/oferta y hover mejorado.
- Ficha de producto con panel de compra, secciones agrupadas y alergenos destacados.
- Catalogo con contador de resultados y empty states accionables.

### SEO
- Metadata con plantilla de titulo y Open Graph en layout.
- JSON-LD de organizacion (home) y producto (ficha).

### Accesibilidad y estilo
- Tipografia system-ui, antialiasing y `:focus-visible` global.

## Rutas publicas nuevas o mejoradas

| Ruta | Proposito |
|------|-----------|
| `/como-funciona` | Explicacion del flujo de compra |
| `/` | Hero, confianza, categorias, destacados y productores |

## Siguiente fase

FASE 15: testing automatizado.
