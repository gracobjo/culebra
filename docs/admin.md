# Panel de administracion

![Logo Sabores de la Culebra](./imagenes/logo.png)


## Estado

FASE 11 completada: panel web para moderar productores, productos, contratos, pedidos, liquidaciones y usuarios. Ampliado con KPIs, plan/simulador, piloto, sandbox, turismo, showroom/impulso, estadísticas operativas, hub CRUD y WAI.

El menú admin está **agrupado por secciones** (Panel, Catálogo, Operaciones, Negocio, Proyecto, Control). Cada enlace muestra una **ayuda visible** bajo el título (no solo al pasar el ratón). Solo un enlace aparece resaltado a la vez: se elige la ruta **más específica** que coincida con la URL (p. ej. en `/admin/showroom/estadisticas` solo se marca **Stats showroom**, no **Showroom**).

Inventario funcional y Python/ML: [`Funcionalidades_Python_IA.md`](./Funcionalidades_Python_IA.md).

Manual de usuario §A4: [`Manual_Usuario_Marketplace.md`](./Manual_Usuario_Marketplace.md) · Rutas y código: [`Manual_Desarrollador_Marketplace.md`](./Manual_Desarrollador_Marketplace.md) §B8.

## Acceso

Solo usuarios con rol `ADMIN`. Ruta: `/admin`.

Crear el primer admin con `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en `.env` y `npm run db:seed`.

Componente de navegación: `apps/web/src/components/admin/admin-nav.tsx`.

---

## Menú por secciones

Cada enlace del menú (`AdminNav`) muestra al pasar el ratón o enfocar con teclado una **ayuda breve** (`title` / `data-hint`). Las seis agrupaciones son:

| Sección | Enfoque |
|---------|---------|
| **Panel** | Cuadro de mando y ajustes del sitio |
| **Catálogo** | Productores, productos, turismo y afiliados |
| **Operaciones** | Pedidos, contratos, pagos y cuentas |
| **Negocio** | KPIs, plan financiero, rentabilidad y rappels |
| **Proyecto** | Showroom, piloto, packaging, convocatorias y pruebas |
| **Control** | Trazabilidad de acciones |

---

### Panel

#### Resumen — `/admin`

**Qué es:** página de inicio del administrador; cuadro de mando con métricas vivas y accesos rápidos.

**Tarjetas del resumen** (cada una enlaza a su sección):

| Tarjeta | Valor mostrado | Qué indica | Destino |
|---------|----------------|------------|---------|
| Productores pendientes | Número | Altas de artesanos en revisión (`PENDING_REVIEW`) | `/admin/productores` |
| Productos pendientes | Número | Fichas enviadas a moderación | `/admin/productos` |
| Contratos por firmar | Número | Versiones de contrato pendientes de firma | `/admin/contratos` |
| Liquidaciones pendientes | Número | Payouts a productores no completados | `/admin/liquidaciones` |
| Pedidos totales | Número | Volumen histórico de pedidos en plataforma | `/admin/pedidos` |
| Showroom | Texto «Margen» | Acceso al simulador del punto físico | `/admin/showroom` |
| Stats showroom | Texto «EDA» | Captura operativa y export para análisis | `/admin/showroom/estadisticas` |
| Alojamientos | Texto «Canal» | Turismo y CRM de hosteleros | `/admin/turismo` |
| Usuarios | Número | Cuentas registradas | `/admin/usuarios` |
| Plan / simulación | Texto «Decisiones» | Viabilidad y escenarios económicos | `/admin/plan` |
| Entregables A.I | Texto «14.500 €» | Checklist del contrato de desarrollo núcleo | `/admin/entregables-ai` |

**Cabecera del resumen:** enlace a la tienda pública (`/tienda`), iconos de redes sociales (si están configuradas) o aviso para configurarlas en **Configuración**.

**Acciones típicas:** revisar pendientes del día, abrir la vitrina como cliente, saltar a showroom o turismo.

---

#### Configuración — `/admin/config`

**Qué hace:**

- **Redes sociales:** URLs de Facebook, Instagram y WhatsApp; se muestran en cabecera, contacto y panel resumen.
- **Hub de la tienda (`/tienda`):** CRUD de bloques visuales (título, imagen, enlace, orden) que componen la página de inicio del marketplace.
- **Auditoría WAI/WCAG:** revisión de accesibilidad en páginas públicas (atributo `lang`, textos alternativos en imágenes, nombres accesibles de controles).

**Quién lo usa:** administración de marca y contenidos; no afecta a comisiones ni pedidos.

---

### Catálogo

#### Productores — `/admin/productores`

**Qué hace:** gestión del ciclo de vida de los artesanos del marketplace.

| Acción | Detalle |
|--------|---------|
| Listar | Todos los productores con estado (borrador, pendiente, activo, suspendido, rechazado) |
| Aprobar / rechazar / suspender | Cambio de estado desde listado o ficha |
| Ficha `/admin/productores/:id` | Datos legales, contacto, comisión %, reglas de comisión, contrato, documentos |
| Comisión | Por defecto **17 %**; el admin puede subir o bajar el % (solo pedidos futuros) |
| Alta automática | Al aprobar, se crea regla de comisión por defecto si no existía |

**Documentación:** [`commissions.md`](./commissions.md) · [`Modelos_Comisiones_Consolidado.md`](./Modelos_Comisiones_Consolidado.md)

---

#### Productos — `/admin/productos`

**Qué hace:** moderación del catálogo creado por los productores.

| Acción | Detalle |
|--------|---------|
| Cola de revisión | Productos en `PENDING_REVIEW` |
| Publicar | Pasa a `PUBLISHED` y aparece en `/productos` |
| Rechazar | Devuelve al productor con motivo |
| Detalle | Precio, stock, categoría, imágenes, IVA |

**Nota:** el productor crea y edita en su panel; el admin solo modera y publica.

---

#### Turismo / alojamientos — `/admin/turismo`

**Qué hace:** canal territorial fuera del checkout de noches (reserva externa).

| Bloque | Función |
|--------|---------|
| **Alojamientos** | Ficha en `/alojamientos`: nombre, municipio, canal de reserva (Booking, web, WhatsApp…), productos relacionados |
| **Packs** | `/packs`: combinación lote del carrito + enlace a noche en alojamiento |
| **Cupones** | Descuentos (`SIERRA10`, etc.) aplicables en checkout |
| **Códigos afiliado (básico)** | Alta rápida de `?ref=`; el programa completo está en **Afiliados** |
| **CRM hosteleros** | Relaciones con casas rurales: modalidades, eventos, contraprestaciones, acuerdos |

**Documentación:** [`tourism.md`](./tourism.md) · [`Estrategia_Alojamientos_Rurales.md`](./Estrategia_Alojamientos_Rurales.md)

---

#### Afiliados — `/admin/afiliados`

**Qué hace:** programa de recomendación con comisión solo por venta confirmada.

| Función | Detalle |
|---------|---------|
| Alta de afiliados | Tipos: alojamiento, productor, creador, guía, embajador, tienda afín |
| Comisión | 8–10 % sobre PVP productos (sin portes); tope 10 % |
| Enlace | `{APP_URL}/productos?ref=CODIGO` → cookie de atribución 15–30 días |
| Ledger | Comisiones automáticas al pagar pedido online + registro manual showroom |
| Pagos | Marcar comisiones pagadas; export CSV; periodicidad mensual/trimestral por afiliado |
| Fidelización | KPIs trimestrales, niveles Colaborador / Embajador / Partner, candidatos a subir nivel |
| Simulador | Margen S.L. con modelo en cascada (canal + productor + packaging) |

**Reglas:** productor-afiliado no comisiona sus propias ventas; ver orden de cálculo en checkout.

**Documentación:** [`Programa_Afiliados_Sabores_Culebra.md`](./Programa_Afiliados_Sabores_Culebra.md) · [`Modelos_Comisiones_Consolidado.md`](./Modelos_Comisiones_Consolidado.md) · [`Programa_Fidelizacion_Afiliados.md`](./Programa_Fidelizacion_Afiliados.md)

**En el sistema:** niveles Colaborador / Embajador / Partner, periodicidad de pago, KPIs trimestrales y candidatos a subir de nivel.

---

### Operaciones

#### Pedidos — `/admin/pedidos`

**Qué hace:** visibilidad global de la operativa comercial.

| Elemento | Detalle |
|----------|---------|
| Listado | Número de pedido, cliente, importe, estado, fecha |
| Detalle `/admin/pedidos/[orderNumber]` | Líneas, productores implicados, pago, envíos, cupón, código afiliado |
| Estados | `PAYMENT_PENDING` → `PAID` → `SHIPPED` → `DELIVERED` (y cancelaciones/devoluciones) |

**Limitación:** no genera etiquetas de transportista; el seguimiento lo marca el productor.

---

#### Contratos — `/admin/contratos`

**Qué hace:** contrato marco entre la S.L. y cada productor.

| Acción | Detalle |
|--------|---------|
| Nueva versión | Texto legal, comisión % asociada, número de versión |
| Enviar a firma | El productor acepta en `/panel/proveedor/contratos` |
| Seguimiento | Pendientes, activos, histórico |

**Documentación:** [`contracts.md`](./contracts.md)

---

#### Liquidaciones — `/admin/liquidaciones`

**Qué hace:** pagos netos a productores tras cada venta.

| Concepto | Detalle |
|----------|---------|
| Payout | Uno por subpedido de productor (`VendorOrder`) |
| Retención | **14 días** (desistimiento) antes de liberar |
| Métodos | Stripe Connect o PayPal según configuración del artesano |
| Estados | `PENDING` (retenido) → `PAID` o error de transferencia |

**Documentación:** [`payments.md`](./payments.md)

---

#### Usuarios — `/admin/usuarios`

**Qué hace:** gobierno de cuentas de la plataforma.

| Acción | Detalle |
|--------|---------|
| Listar | Consumidores, productores y admins |
| Suspender / reactivar | Bloquea o restaura acceso |
| Roles | ADMIN, VENDOR, CONSUMER |

---

### Negocio

#### KPIs / riesgos — `/admin/kpis`

**Qué hace:** salud operativa del modelo multimarca.

| Bloque | Métricas |
|--------|----------|
| **Riesgos** | % incidencias SLA, concentración GMV top 3, cuota máxima por productor, productores activos 90 días |
| **Por artesano** | Tiempo de preparación, roturas, embalaje, valoraciones |
| **Alertas** | Niveles OK / WARNING / CRITICAL con umbrales documentados |

**Documentación:** [`Riesgos_Modelo_Multimarca.md`](./Riesgos_Modelo_Multimarca.md)

---

#### Plan / simulación — `/admin/plan`

**Qué hace:** herramienta de decisión financiera a medio plazo.

| Bloque | Detalle |
|--------|---------|
| PyG plan viabilidad | Proyección a 5 años (ingresos, costes, EBITDA) |
| Modelo online + showroom | Escenario a 3 años |
| **Simulador** | Comisión %, costes fijos, RETA, marketing, ticket medio, escala GMV |
| Gráficos | Sensibilidad y puntos de equilibrio |
| Botón **Restablecer** | Vuelve valores por defecto del simulador |

**Uso:** validar hipótesis antes de cambiar precios, comisiones o inversión en marketing.

---

#### Rentabilidad — `/admin/rentabilidad`

**Qué hace:** margen neto real por transacción en pedidos ya pagados.

| Concepto | Detalle |
|----------|---------|
| Ingreso S.L. | Comisión marketplace retenida |
| Costes imputables | Stripe, amortización maquinaria, envasado, transporte, cloud, gestoría |
| Resultado | Beneficio neto y % margen por pedido y por productor |

**Nota:** complementa al simulador del Plan con datos reales del histórico.

---

#### Rappels — `/admin/rappels`

**Qué hace:** bonificación anual a productores por volumen (tramos Bronce / Plata / Oro).

| Tramo | Facturación anual | Comisión efectiva | Rappel |
|-------|-------------------|-------------------|--------|
| Bronce | ≤ 5.000 € | 17 % | — |
| Plata | 5.001–15.000 € | 14 % | 3 % |
| Oro | > 15.000 € | 12 % | 5 % |

| Acción | Detalle |
|--------|---------|
| Proyección en vivo | Estimación durante el año (pedidos no cancelados) |
| Cerrar año | Congela `RappelSettlement` |
| Abonar | Transferencia o compensación en liquidaciones |

**Documentación:** [`commissions.md`](./commissions.md) · [`Clausula_Comision_Rappels_Productor.md`](./Clausula_Comision_Rappels_Productor.md)

---

### Proyecto

#### Showroom — `/admin/showroom`

**Qué hace:** simulador operativo del punto de venta físico (plan 90 días).

| Módulo | Detalle |
|--------|---------|
| Visitas y conversión | Proyección de tráfico, ticket y ventas |
| Lista de 8 | SKUs prioritarios en mostrador |
| Tote / impulso | Métricas de venta adicional en caja (*attach impulso*) |
| Playbook cestas | Escapada, Comarca, Sierra, Reserva |
| Estrategia alojamientos | Simulador de canal rural integrado |
| Botón **Restablecer** | Valores por defecto del simulador |

**Documentación:** [`Showroom_Optimizacion_90_Dias.md`](./Showroom_Optimizacion_90_Dias.md) · [`Showroom_Ingresos_Cestas.md`](./Showroom_Ingresos_Cestas.md)

---

#### Precios showroom — `/admin/showroom/precios`

**Qué hace:** catálogo persistente de **coste** y **PVP** del showroom (BD).

| Bloque | Detalle |
|--------|---------|
| Cestas | PVP ticket + coste packaging (Escapada, Comarca, Sierra, Reserva) |
| Packaging unitario | Caja kraft, tag, relleno, tarjeta |
| Merchandising | Tote (coste compra + PVP) |
| Experiencias | Mini-cata, cata/taller, ingreso anual de catas (PyG) |

Al guardar, alimenta márgenes de `/admin/showroom`, costes de `/admin/packaging` y defaults de `/admin/plan`.

---

#### Stats showroom — `/admin/showroom/estadisticas`

**Qué hace:** datos operativos reales del showroom para análisis y ML.

| Función | Detalle |
|---------|---------|
| **Captura diaria** | Formulario de KPIs (visitas, ventas, ticket, contactos, online…) |
| **Procedencia** | Formulario móvil 10 s: ¿de dónde nos visitáis? (local, CyL, Madrid…) |
| **EDA** | Gráficos de series, conversión, procedencia, productos |
| **Informe KPI** | Tabla accesible, glosario de términos, descarga `.txt` |
| **Export CSV** | 43 columnas operativas + CSV procedencia |
| **Demo sintético** | Carga datos de ejemplo para probar gráficos |
| Sincronización | Parcial desde pedidos pagados y CRM |

**Documentación:** [`Showroom_Procedencia_Visitantes.md`](./Showroom_Procedencia_Visitantes.md) · [`Variables_Decision_Datasets_Kaggle.md`](./Variables_Decision_Datasets_Kaggle.md)

---

#### Fidelización — `/admin/showroom/fidelizacion`

**Qué hace:** programas de retención en tienda física (sin comisión B2B).

| Mecánica | Detalle |
|----------|---------|
| **Rasca y gana** | Premios ponderados; 1 premio cada N rascas; tope mensual |
| **Tarjeta de sellos** | X visitas → premio (tote, mini-cesta, dto) |
| **Club WhatsApp** | Alta con códigos promocionales por procedencia |
| **Trae a un amigo** | Referidos con recompensa |
| KPIs mensuales | Rascas, sellos completados, altas club, referidos |

**Documentación:** [`Showroom_Fidelizacion_Premios.md`](./Showroom_Fidelizacion_Premios.md)

---

#### Packaging — `/admin/packaging`

**Qué hace:** diseño y coste de envases de cestas.

| Elemento | Detalle |
|----------|---------|
| Cajas kraft | Tipos por cesta (Escapada, Comarca…) |
| Mosaico geométrico | Identidad visual del packaging |
| Tags y frases | Textos de impresión en etiquetas |
| Costes unitarios | Impacto en margen neto S.L. |

**Documentación:** [`Packaging_Sabores_Culebra.md`](./Packaging_Sabores_Culebra.md)

---

#### Grupo piloto — `/admin/piloto`

**Qué hace:** seguimiento del programa de productores fundadores (meses 2–6).

| Función | Detalle |
|---------|---------|
| Productores piloto | Objetivo ~5 fundadores; fases y tareas |
| Roadmap | Captación puerta a puerta, beta, activación |
| **CRUD categorías** | Categorías agro + hostelería en BD |
| Propuesta de valor | Ficha `/admin/piloto/[id]/propuesta` por productor |

**Documentación:** [`Flujo_Operativo_Piloto.md`](./Flujo_Operativo_Piloto.md)

---

#### La Raya L1 — `/admin/raya`

**Qué hace:** checklist documental de la convocatoria **La Raya Línea 1**.

| Contenido | Detalle |
|-----------|---------|
| Base 8ª | Requisitos y plazos |
| Secuencia | ICECYL → Diputación de Zamora |
| Estado | Casillas de documentación preparada / enviada |

**Documentación:** [`Checklist_Convocatoria_La_Raya_Linea1.md`](./Checklist_Convocatoria_La_Raya_Linea1.md)

---

#### Entregables A.I — `/admin/entregables-ai`

**Qué hace:** seguimiento del contrato de desarrollo del núcleo marketplace (~14.500 €).

| Entregable | Verificación |
|------------|--------------|
| A.1 Marketplace base | Catálogo, carrito, checkout |
| A.2 Panel productor | Productos, pedidos, liquidaciones |
| A.3 Admin | Este panel |
| A.5a Documentación | Manuales y docs técnicos |

**Documentación:** [`Entregables_Contrato_AI_Nucleo_Marketplace.md`](./Entregables_Contrato_AI_Nucleo_Marketplace.md)

---

#### Sandbox — `/admin/sandbox`

**Qué hace:** prueba end-to-end **sin Stripe real** del ciclo comercial completo.

Ver § [Sandbox](#sandbox-adminsandbox) más abajo para el flujo paso a paso.

---

### Control

#### Auditoría — `/admin/auditoria`

**Qué hace:** registro inmutable de acciones relevantes.

| Campo | Detalle |
|-------|---------|
| Quién | Usuario admin (o sistema) |
| Qué | CREATE, UPDATE, APPROVE, SIGN, etc. |
| Cuándo | Marca temporal |
| Entidad | Productor, contrato, comisión, producto… |

**Uso:** trazabilidad ante incidencias, revisiones o auditorías externas.

---

## Comisiones (ficha productor)

Las reglas de comision se gestionan en `/admin/productores/:id`:

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

| Métrica | Alerta | Crítico | Qué implica |
|---------|--------|---------|-------------|
| % subpedidos con incidencia (SLA breached, tarde &gt;24 h, cancelados) | &gt; 10 % | &gt; 15 % | Reputación de toda la plataforma |
| Concentración GMV top 3 productores | &gt; 65 % | &gt; 70 % | Marketplace poco diversificado |
| Máx. cuota GMV de un productor | &gt; 25 % | &gt; 30 % | Dependencia de una sola marca |
| Productores con venta en 90 días | &lt; 5 | &lt; 3 | Sin masa crítica comercial |

En cada tarjeta de `/admin/kpis` se muestra **qué mide** e **impacto** en el negocio. También: % pedidos multiproductor, GMV del mes, tabla de cuotas por productor, y KPIs individuales (preparación &lt;24 h, roturas, embalaje, valoraciones). Código: `apps/web/src/lib/admin-risk-metrics.ts`. Doc: [`Riesgos_Modelo_Multimarca.md`](./Riesgos_Modelo_Multimarca.md).

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
