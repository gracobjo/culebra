# SEO

## Estado

FASE 14 completada: sitemap dinamico, robots, metadatos canonicos y datos estructurados.

## Implementacion

### Sitemap y robots

- `GET /sitemap.xml` — generado desde `apps/web/src/app/sitemap.ts`
- Incluye rutas estaticas, productos publicados, productores activos y categorias
- `GET /robots.txt` — bloquea areas privadas y referencia el sitemap

### Metadatos

Helper `buildPageMetadata` en `apps/web/src/lib/site.ts`:

- titulo y descripcion
- URL canonica (`alternates.canonical`)
- Open Graph y Twitter Cards
- keywords del territorio y sector

Variable requerida en produccion:

```env
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### Datos estructurados (JSON-LD)

Helpers en `apps/web/src/lib/seo.ts`:

| Schema | Paginas |
|--------|---------|
| Organization + WebSite | Home |
| Product | Ficha de producto |
| BreadcrumbList | Producto, categoria, productor |
| LocalBusiness | Ficha de productor |
| CollectionPage | Categoria |

### Areas no indexables

Layouts con `robots: noindex` en:

- `/admin/*`
- `/cuenta/*`
- `/panel/*`

Ademas bloqueadas en `robots.txt`: checkout, carrito, login, register, pedido.

## Servicio de datos

`packages/auth/src/seo.service.ts` expone slugs para el sitemap:

- `listPublicProductUrlsForSitemap`
- `listPublicVendorUrlsForSitemap`
- `listCategoryUrlsForSitemap`

## Siguiente fase

FASE 16: despliegue (Docker produccion, cloud, backups).
