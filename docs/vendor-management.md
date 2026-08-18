# Gestion de proveedores

## Estado

FASE 4 completada: onboarding, perfil, pagina publica, panel productor y moderacion admin via API.

## Flujo del productor

1. Registro/login como consumidor.
2. Solicitud en `/quiero-vender`.
3. Perfil en estado `DRAFT`.
4. Edicion en `/panel/proveedor`.
5. Envio a revision → `PENDING_REVIEW`.
6. Aprobacion admin → `ACTIVE` (pagina publica visible).

## Estados

- `DRAFT`
- `PENDING_REVIEW`
- `ACTIVE`
- `SUSPENDED`
- `REJECTED`

## API

| Metodo | Ruta | Acceso |
|--------|------|--------|
| GET | `/vendors` | Publico |
| GET | `/vendors/:slug` | Publico |
| POST | `/vendors/apply` | Autenticado |
| GET | `/vendors/me/profile` | VENDOR |
| PATCH | `/vendors/me/profile` | VENDOR |
| POST | `/vendors/me/submit` | VENDOR |
| GET | `/admin/vendors` | ADMIN |
| PATCH | `/admin/vendors/:id/status` | ADMIN |

## Web

- `/quiero-vender` — alta inicial
- `/panel/proveedor` — panel privado
- `/productores` — listado publico
- `/productores/[slug]` — ficha publica

## Moderacion

Solo proveedores `ACTIVE` aparecen en el listado y ficha publica. La moderacion de certificaciones y documentos se implementara en fases posteriores.

## Siguiente fase

FASE 5: productos, catalogo y moderacion de productos.
