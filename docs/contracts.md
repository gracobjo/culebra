# Contratos

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)


## Estado

FASE 9 completada: contratos versionados productor–plataforma con aceptacion auditada.

## Principios

- Contratos versionados (nunca se sobrescribe una version publicada).
- Historial completo de versiones y aceptaciones.
- Auditoria en creacion, publicacion y firma (`AuditLog`).
- Hash SHA-256 del texto aceptado + IP del productor (preparacion para firma electronica).

## Flujo

1. **Admin** crea una version en borrador:
   `POST /admin/vendors/:vendorId/contracts/versions`
2. **Admin** la publica para firma:
   `POST /admin/contracts/:contractId/versions/:versionId/publish`
3. **Productor** revisa en `/panel/proveedor/contratos` y acepta.
4. La version pasa a `ACTIVE`; versiones activas anteriores quedan `EXPIRED`.

## Reglas de negocio

- Solo puede haber una version `PENDING_SIGNATURE` por contrato.
- Para enviar productos a revision hace falta un contrato `ACTIVE` (`VENDOR_CONTRACT_REQUIRED`).
- La comision indicada en el contrato es el respaldo si no hay `CommissionRule` vigente (FASE 10).
- Al aceptar un contrato con porcentaje, se sincroniza una regla `PERCENTAGE` si hace falta.

## API

| Metodo | Ruta | Rol |
|--------|------|-----|
| GET | `/admin/contracts` | ADMIN |
| GET | `/admin/contracts/:id` | ADMIN |
| POST | `/admin/vendors/:vendorId/contracts/versions` | ADMIN |
| POST | `/admin/contracts/:contractId/versions/:versionId/publish` | ADMIN |
| GET | `/vendors/me/contracts` | VENDOR |
| POST | `/vendors/me/contracts/versions/:versionId/accept` | VENDOR |

## Aviso legal

Plantillas y clausulas contractuales definitivas: `[REVISAR CON ABOGADO]`

## Siguiente fase

FASE 12: UX/UI del marketplace.
