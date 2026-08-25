# Panel de administracion

![Logo Sabores de la Culebra](./imagenes/logo.png)


## Estado

FASE 11 completada: panel web para moderar productores, productos, contratos, pedidos, liquidaciones y usuarios. Ampliado con KPIs, plan/simulador, piloto, sandbox, turismo, showroom/impulso, hub CRUD y WAI.

El menú admin está **agrupado por secciones** (Panel, Catálogo, Operaciones, Negocio, Proyecto, Control). Inventario funcional y Python/ML: [`Funcionalidades_Python_IA.md`](./Funcionalidades_Python_IA.md).

## Acceso

Solo usuarios con rol `ADMIN`. Ruta: `/admin`.

Crear el primer admin con `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en `.env` y `npm run db:seed`.

## Modulos

| Ruta | Funcion |
|------|---------|
| `/admin` | Resumen de pendientes |
| `/admin/entregables-ai` | Checklist técnico núcleo A.I |
| `/admin/raya` | Checklist convocatoria **La Raya Línea 1** (docs Base 8ª, secuencia ICECYL → Diputación) |
| `/admin/config` | Redes; **CRUD bloques hub**; **auditoría WAI/WCAG** |
| `/admin/showroom` | Simulador 90 días; lista de 8; tote; **métricas de impulso**; playbook cestas |
| `/admin/packaging` | Cajas kraft + mosaico geométrico, tags, frases y costes por cesta |
| `/admin/productores` | Aprobar, rechazar o suspender |
| `/admin/productos` | Publicar o rechazar fichas |
| `/admin/turismo` | Alojamientos, packs, cupones, afiliados; **CRM hosteleros** + estrategia 90 d |
| `/admin/contratos` | Crear versiones y enviar a firma |
| `/admin/pedidos` | Consultar pedidos de la plataforma |
| `/admin/liquidaciones` | Payouts a productores |
| `/admin/usuarios` | Suspender o reactivar cuentas |
| `/admin/kpis` | KPIs por artesano + **riesgos del modelo** (incidencias, GMV, activos) |
| `/admin/plan` | Plan 5 años (Excel) + **modelo 3 años online/showroom** + simulador |
| `/admin/rentabilidad` | Rentabilidad por transaccion |
| `/admin/rappels` | Rappels: proyección, cierre de año y pendientes de abono |
| `/admin/piloto` | Grupo piloto (productores fundadores + CRUD categorías BD) |
| `/admin/sandbox` | Simulacion end-to-end sin Stripe real |
| `/admin/auditoria` | Logs de auditoria |

Las reglas de comision se gestionan en la ficha del productor (`/admin/productores/:id`):

- **Comision por defecto de la plataforma:** **17 %** (`DEFAULT_MARKETPLACE_COMMISSION_PERCENT`).
- Al **aprobar** un productor (`ACTIVE`) se crea regla al porcentaje por defecto si no tenia ninguna.
- Para **subir o bajar** la comision: introduce el nuevo % y pulsa *Actualizar comision (%)*. Solo aplica a pedidos futuros.
- Productores piloto / fundadores pueden acordar **12 %** el primer año (ver plan y clausula de rappels).

Ver detalle en `docs/commissions.md`.

## Sandbox (`/admin/sandbox`)

Valida el ciclo completo en local. Flujo:

1. Crear pedido → `PAYMENT_PENDING`
2. Simular pago OK → `PAID` + payout retenido 14 dias
3. Confirmar + Enviar → VendorOrder `SHIPPED`
4. Fast-forward retencion → adelanta `releasesAt` (no libera dinero)
5. Liberar payouts → payout `PAID` (sin Stripe)
6. Marcar entregado → `DELIVERED` (boton activo solo con lineas `SHIPPED`)

Cada accion redirige con query (`?created=`, `?paid=`, `?shipped=`, `?retention=`, `?released=`, `?delivered=` o `?error=`) y muestra banner. Codigo: `apps/web/src/app/admin/sandbox/`.

Manual de usuario §A4.5 y manual de desarrollador §B8.2.

## Turismo (admin)

En `/admin/turismo` se gestionan entidades que **no** pasan por el checkout de noches:

- Alojamientos publicados en `/alojamientos` (URL de reserva externa + productos relacionados).
- Packs (`/packs`): lote = productos del carrito; noche = enlace al alojamiento.
- Cupones y codigos de afiliado (`?ref=`).

Ver `docs/tourism.md`.

## KPIs y riesgos (`/admin/kpis`)

Bloque **Riesgos del modelo multimarca** (mes en curso):

| Métrica | Alerta | Crítico |
|---------|--------|---------|
| % subpedidos con incidencia (SLA breached, tarde &gt;24 h, cancelados) | &gt; 10 % | &gt; 15 % |
| Concentración GMV top 3 productores | &gt; 65 % | &gt; 70 % |
| Máx. cuota GMV de un productor | &gt; 25 % | &gt; 30 % |
| Productores con venta en 90 días | &lt; 5 | &lt; 3 |

También: % pedidos multiproductor, GMV del mes, tabla de cuotas por productor, y KPIs individuales (preparación &lt;24 h, roturas, embalaje, valoraciones). Código: `apps/web/src/lib/admin-risk-metrics.ts`. Doc: [`Riesgos_Modelo_Multimarca.md`](./Riesgos_Modelo_Multimarca.md).

## API extra

| Metodo | Ruta |
|--------|------|
| GET | `/admin/dashboard` |
| GET | `/admin/users` |
| PATCH | `/admin/users/:id/status` |
| GET | `/admin/orders` |
| GET | `/admin/orders/:orderNumber` |

## Siguiente fase

FASE 12: UX/UI del marketplace (navegacion, fichas, confianza y conversion).
