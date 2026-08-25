# Manual de Usuario — Marketplace Villardeciervos

![Logo Sabores de la Culebra](./imagenes/logo.png)

> Basado en las funcionalidades implementadas del marketplace (Villardeciervos).

**Documentos relacionados:** [Requisitos y casos de uso](./Requisitos_Funcionales_NoFuncionales_UseCases_UML.md) · [Panel admin — menú completo](./admin.md) · [Turismo (fases 2–3)](./tourism.md) · [Catálogo](./catalog.md) · [Carrito](./cart.md)

---

## A. Manual de Usuario (Consumidor / Productor / Admin)

### A1. Acceso, roles y seguridad

La aplicación usa autenticación con roles:

- **CONSUMER**: comprador final (navega, compra, paga, recibe notificaciones, deja reviews).
- **VENDOR**: productor/artesano (recibe pedidos, confirma preparación, marca envío/entrega).
- **ADMIN**: supervisa KPIs, liquidaciones, rentabilidad, rappels, grupo piloto y sandbox.

Rutas típicas:

- Inicio: `/`
- **Tienda (hub):** `/tienda` — categorías agro + turismo rural + packs
- Productos: `/productos`, `/productos/[slug]`
- Categorías agro: `/categorias/[slug]` (`/categorias` redirige a `/tienda`)
- Productores: `/productores`
- Alojamientos (directorio): `/alojamientos`, `/alojamientos/[slug]`
- Packs: `/packs`, `/packs/[slug]`
- Cuenta: `/cuenta`
- Login/Register: `/login`, `/register`
- Carrito: `/carrito`
- Checkout: `/checkout`
- Pedido (detalle): `/pedido/[orderNumber]`
- Panel productor: `/panel/proveedor/*`
- Panel admin: `/admin/*` (incluye `/admin/turismo`)

---

### A2. Funcionalidades del Consumidor

#### 1) Tienda de la comarca (hub)

- Entra en `/tienda`:
  - **Agroalimentario:** tarjetas de categoría → `/categorias/[slug]` → compra en el marketplace.
  - **Turismo rural:** → `/alojamientos` (directorio; la reserva se hace fuera).
  - **Packs:** → `/packs` (lote gourmet en carrito; noche = reserva externa).
- Regla de producto: **el checkout solo vende productos agroalimentarios**. La estancia no se cobra en el carrito.

#### 2) Navegar catálogo unificado

- Explora categorías y productos desde la tienda o `/productos`.
- Los productos pueden pertenecer a **diferentes productores**.
- En fichas de producto puede aparecer cross-sell: *“Si vienes a la sierra…”* (alojamientos relacionados).
- En fichas de alojamiento: *“Si te alojaste aquí, prueba estos productos”*.

#### 3) Carrito multi-proveedor

- Añade productos (o un pack completo: añade sus líneas de producto).
- Puedes aplicar un **cupón** en `/carrito` (código; descuento % o fijo según reglas).
- Si llegas con `?ref=CODIGO` (afiliado de un alojamiento), el código se guarda en cookie y se asocia al pedido en checkout.
- **Envío:** tarifa plana de **6,50 €** por pedido, siempre a cargo del cliente (sin envío gratis).
- El sistema prepara el pedido agregando vendedores implicados.

#### 4) Checkout y pago avanzado (Stripe Connect + Bizum)

##### ¿Qué es Stripe y por qué se usa?

**Stripe** es el intermediario financiero regulado que custodia el dinero del comprador y lo distribuye automáticamente entre el marketplace y cada productor artesano. El sistema nunca maneja el dinero directamente: todo pasa por Stripe, que cumple la normativa europea de pagos (PSD2).

**Stripe Connect** es la capa de Stripe que permite tener múltiples vendedores (los artesanos), cada uno con su propia cuenta bancaria conectada, y repartir el dinero de forma automática sin intervención manual. Es el mismo modelo que usa Amazon con sus vendedores.

##### Métodos de pago disponibles

- **Tarjeta bancaria** (Visa, Mastercard, American Express — europeas y no europeas).
- **Bizum** — pago instantáneo desde el móvil vinculado a la cuenta bancaria.
- **Wallets digitales** (Google Pay, Apple Pay) — si el dispositivo los tiene configurados.

##### Flujo completo paso a paso

```
1. PAGO        → El cliente introduce su tarjeta o confirma Bizum.
                 El dinero va a Stripe, NO a la cuenta del marketplace.

2. RETENCIÓN   → Stripe congela los fondos 14 días (derecho legal de
                 desistimiento). El cliente puede devolver sin preguntas.

3. SPLIT       → Stripe divide el importe automáticamente:
                   · 17% → comisión del marketplace (S.L.) por defecto
                   · resto → payout del productor artesano
                   · ~1–2% → comisión propia de Stripe (descontada del total)

4. LIBERACIÓN  → Al día 15, el CronJob nocturno comprueba los payouts
                 maduros y los libera. El dinero llega al banco del
                 productor sin que nadie tenga que hacer nada.

5. DEVOLUCIÓN  → Si hay desistimiento antes del día 14, Stripe devuelve
                 el importe íntegro al cliente. Nadie cobra comisión.
```

##### Ejemplo real — tarjeta española

> Cesta de **50,00 €** pagada con Visa española.

| Concepto | Cálculo | Importe |
|---|---|---:|
| Importe pagado por el cliente | — | 50,00 € |
| Comisión Stripe (1,5% + 0,25 €) | 50 × 0,015 + 0,25 | −1,00 € |
| Comisión marketplace (17%) | 50 × 0,17 | −8,50 € |
| **Payout neto al productor** | 50 − 1,00 − 8,50 | **40,50 €** |

##### Ejemplo real — Bizum

> Cesta de **50,00 €** pagada con Bizum.

| Concepto | Cálculo | Importe |
|---|---|---:|
| Importe pagado por el cliente | — | 50,00 € |
| Comisión Stripe Bizum (0,8% + 0,25 €) | 50 × 0,008 + 0,25 | −0,65 € |
| Comisión marketplace (17%) | 50 × 0,17 | −8,50 € |
| **Payout neto al productor** | 50 − 0,65 − 8,50 | **40,85 €** |

> Bizum es ligeramente más barato para el productor porque la comisión de Stripe es menor que con tarjeta.

##### ¿Cuánto cuesta estar dado de alta en Stripe?

**Nada.** Stripe no tiene cuota mensual fija. Solo cobra cuando hay una venta. Sin ventas, coste cero. Tanto la cuenta del marketplace como las subcuentas de cada productor artesano son gratuitas — Stripe solo requiere verificación de identidad (DNI + datos bancarios).

##### Tarifa oficial de Stripe en España (2026)

| Tipo de pago | Comisión Stripe |
|---|---:|
| Tarjeta europea (Visa/Mastercard) | 1,5% + 0,25 € / transacción |
| Tarjeta no europea | 3,25% + 0,25 € / transacción |
| Bizum | ~0,8% + 0,25 € / transacción |

> La comisión de Stripe se descuenta automáticamente del flujo antes de repartir. Nunca se paga por separado ni sale de la caja de la empresa.

#### 5) Estado del pedido y notificaciones

- Tras el pedido, el sistema muestra el estado (pendiente de pago, pagado, envío, etc.).
- Se envían emails:
  - **Confirmación de pedido** (al comprador, best-effort).
  - **Aviso de envío** (cuando el productor marca el pedido como enviado).

#### 6) Reviews post-compra (opcional pero habilitadas)

- En la página `/pedido/[orderNumber]` aparece el formulario si:
  - el usuario está autenticado,
  - el pedido está pagado,
  - el producto está en el pedido,
  - **no existe** review previa del mismo producto.
- Incluye validación del lado servidor y estrellas + comentario/título opcionales.

---

### A3. Funcionalidades del Productor (VENDOR)

#### 1) Gestión de pedidos

- Recibe subpedidos (VendorOrder) por pedido del consumidor.
- Estados típicos:
  - `PENDING` → `CONFIRMED` → `IN_PREPARATION`/`SHIPPED` → `DELIVERED`

#### 2) Envío (shipping)

- Cuando el productor marca `SHIPPED`:
  - se crea/actualiza `Shipment` con carrier/tracking,
  - el sistema envía el email de **shipment notification** al comprador (best-effort),
  - se sincroniza el estado del pedido padre.

#### 3) Gestión de productos (crear, enviar a revisión y publicación)

El flujo de productos está diseñado para que el productor:
- cree un producto en estado `DRAFT`,
- lo envíe a revisión,
- y espere a que el admin lo revise y publique.

Flujo recomendado:
1. Ve al panel productor:
   - `/panel/proveedor/productos` (**Mis productos**)
   - pulsa **“Nuevo producto”**.
2. Rellena los datos requeridos:
   - `Nombre`
   - `Categoría`
   - `Precio (EUR)`
3. (Recomendado) Sube la **foto propia** del producto al inicio del formulario (`#foto`).
   - Si no subes foto, el sistema muestra un PNG por defecto según la categoría.
   - En la lista «Mis productos» verás miniatura, aviso de productos sin foto y el botón **Añadir foto** / **Cambiar foto**.
4. Pulsa **“Crear producto”** / **“Guardar cambios”**.
   - La foto se sube al servidor y la URL se guarda al guardar el formulario.
   - El producto se guarda inicialmente en `DRAFT` (alta) o mantiene su estado (edición).
5. Pulsa **“Enviar a revisión”**.
   - Solo se habilita si el producto está en `DRAFT` o `REJECTED`.

Requisito de contrato:
- Para poder “Enviar a revisión”, tu proveedor debe tener un **contrato activo** con la plataforma.
- Si al pulsar “Enviar a revisión” te aparece un error de “contrato requerido”:
  - entra en `/panel/proveedor/contratos`,
  - y si existe una versión pendiente, acéptala.
  - si no existe versión pendiente, el **admin** debe crear/enviar a firma la versión del contrato antes de que puedas continuar.

Publicación y visibilidad:
- El catálogo público `/productos` muestra únicamente productos en estado `PUBLISHED`.
- Hasta que el admin publique, el producto no aparecerá en el catálogo.
- Si eres el dueño de la ficha publicada, verás un aviso en la ficha pública con acceso rápido a editar / cambiar foto.

#### 4) Edición de productos publicados

- Desde `/panel/proveedor/productos`, pulsa el nombre del producto o **Editar**.
- Puedes modificar datos comerciales (PVP, stock) y, según el estado, también nombre, descripción, categoría e imagen.
- Cada cambio relevante queda registrado y puedes descargar un **PDF del cambio** en el historial de la ficha del producto (conservado mínimo 3 meses).

#### 5) Documentos PDF

| Documento | Dónde | Para qué sirve |
|-----------|-------|----------------|
| PDF del subpedido | `/panel/proveedor/pedidos/[id]` | Resumen operativo y liquidación de tu parte del pedido |
| PDF del cambio de producto | `/panel/proveedor/productos/[id]` | Justificante de una modificación (precio, stock, etc.) |
| PDF de tus compras | `/panel/proveedor/mis-compras` | Justificantes cuando compras como consumidor |

Todos los PDF incluyen el **logo**, el **nombre del marketplace** y la **fecha** del documento.

Como consumidor, el justificante del pedido está en `/pedido/[orderNumber]` y en `/cuenta/pedidos`.

Más detalle: [documents.md](./documents.md).

#### 6) Pagos, comisión y liquidaciones

**Comisión del marketplace:** por defecto la plataforma retiene un **17 %** del bruto de tus ventas. El administrador puede acordar otro porcentaje (subir o bajar) en tu ficha de productor; los cambios solo afectan a pedidos nuevos.

Consulta tu comisión efectiva en `/panel/proveedor/liquidaciones`.

**Cómo recibes tu neto** (`/panel/proveedor/pagos`):

| Método | Qué necesitas |
|--------|----------------|
| **Stripe Connect** | Completar onboarding Express (cuenta bancaria, datos fiscales) |
| **PayPal** | Indicar el email de tu cuenta PayPal |

El cliente siempre paga con tarjeta/Bizum en la plataforma (Stripe). Tu neto se transfiere tras **14 días** de retención legal.

Si no configuras cobros, puedes vender igualmente pero las liquidaciones quedan **pendientes** hasta que completes Stripe o PayPal.

Más detalle: [payments.md](./payments.md) y [commissions.md](./commissions.md).

---

### A4. Funcionalidades del Admin (ADMIN)

Acceso: rol **ADMIN**, ruta base `/admin`. El menú está **agrupado en seis bloques**; cada enlace muestra **debajo del título** una frase breve sobre su función (además del resaltado verde en la página actual).

Referencia técnica completa (cada tarjeta del menú y del resumen): [`admin.md`](./admin.md).

#### Tarjetas del resumen (`/admin`)

Además del menú, la página de inicio muestra **11 tarjetas** con acceso directo: productores pendientes, productos pendientes, contratos por firmar, liquidaciones pendientes, pedidos totales, showroom, stats showroom, alojamientos, usuarios, plan/simulación y entregables A.I. Cada tarjeta muestra un número en vivo o una etiqueta («Margen», «EDA», «Canal»…) y enlaza a su sección. Detalle en [`admin.md`](./admin.md) § Resumen.

#### Mapa del menú

##### Panel

| Enlace | Ruta | Para qué sirve |
|--------|------|----------------|
| Resumen | `/admin` | Cuadro de mando: pendientes de productores, productos, contratos y liquidaciones; accesos rápidos a showroom, estadísticas y turismo. |
| Configuración | `/admin/config` | Redes sociales del sitio; bloques visuales del hub de la tienda; auditoría de accesibilidad (WAI) en páginas públicas. |

##### Catálogo

| Enlace | Ruta | Para qué sirve |
|--------|------|----------------|
| Productores | `/admin/productores` | Dar de alta, aprobar, rechazar o suspender artesanos; ajustar comisión % en cada ficha. |
| Productos | `/admin/productos` | Revisar fichas enviadas por productores y publicarlas o rechazarlas. |
| Turismo / alojamientos | `/admin/turismo` | Directorio de alojamientos, packs, cupones, afiliados básicos y CRM de hosteleros. Ver §A4.7. |
| Afiliados | `/admin/afiliados` | Programa de recomendación: códigos `?ref=`, comisiones 8–10 %, ledger y simulador de margen. Ver §A4.8. |

##### Operaciones

| Enlace | Ruta | Para qué sirve |
|--------|------|----------------|
| Pedidos | `/admin/pedidos` | Ver pedidos del marketplace y su estado (pago, envío, entrega). |
| Contratos | `/admin/contratos` | Publicar nuevas versiones del contrato y enviarlas a firma digital. |
| Liquidaciones | `/admin/liquidaciones` | Seguir pagos netos a productores tras la retención legal de 14 días. |
| Usuarios | `/admin/usuarios` | Suspender o reactivar cuentas de la plataforma. |

##### Negocio

| Enlace | Ruta | Para qué sirve |
|--------|------|----------------|
| KPIs / riesgos | `/admin/kpis` | Desempeño por artesano y alertas del modelo multimarca. Ver §A4.1. |
| Plan / simulación | `/admin/plan` | Plan económico y simulador de escenarios. Ver §A4.6. |
| Rentabilidad | `/admin/rentabilidad` | Beneficio neto por transacción con costes imputables. Ver §A4.2. |
| Rappels | `/admin/rappels` | Bonificaciones por volumen anual a productores. Ver §A4.3. |

##### Proyecto

| Enlace | Ruta | Para qué sirve |
|--------|------|----------------|
| Showroom | `/admin/showroom` | Simulador del punto físico: conversión, impulso en caja, lista de 8, cestas y plan 90 días. |
| Stats showroom | `/admin/showroom/estadisticas` | Registro diario en base de datos, procedencia visitantes, gráficos EDA, informe KPI, export CSV para Python/ML y carga demo. |
| Fidelización | `/admin/showroom/fidelizacion` | Rasca y gana, sellos, Club WhatsApp y referidos en tienda física. |
| Packaging | `/admin/packaging` | Diseño de cajas kraft, frases de etiqueta y costes de packaging por cesta. |
| Grupo piloto | `/admin/piloto` | Programa piloto de productores fundadores. Ver §A4.4. |
| La Raya L1 | `/admin/raya` | Checklist documental de la convocatoria La Raya (ICECYL + Diputación). |
| Entregables A.I | `/admin/entregables-ai` | Estado de entregables técnicos del contrato de desarrollo núcleo. |
| Sandbox | `/admin/sandbox` | Probar el flujo completo de compra sin cobro real. Ver §A4.5. |

##### Control

| Enlace | Ruta | Para qué sirve |
|--------|------|----------------|
| Auditoría | `/admin/auditoria` | Historial de acciones administrativas relevantes. |

#### 1) KPIs para evaluar desempeño

- Panel `/admin/kpis` con objetivos y niveles (OK/WARNING/CRITICAL).

#### 2) Rentabilidad por transacción

- Panel `/admin/rentabilidad`: ingresa comisiones, calcula costes imputables (amortización, envasado, transporte, cloud/gestoría), y muestra beneficio neto.

#### 3) Rappels por productor / por tramo

- Panel `/admin/rappels`: proyección en vivo, cierre de año (`RappelSettlement`) y abono (transferencia o compensación).

#### 4) Grupo Piloto (Mes 2–6)

- Panel `/admin/piloto`:
  - gestión de productores piloto (objetivo: 5),
  - checklist por fase (selección, captación puerta a puerta, beta/ensayo),
  - estado del onboarding y tareas por productor,
  - KPIs de progreso del programa (onboarded/activos, tareas completadas),
  - **CRUD de categorías** (agro + hostelería/turismo) persistidas en BD; el desplegable del alta usa solo categorías activas.

#### 5) Sandbox (validación rápida end-to-end)

Panel `/admin/sandbox`. Sirve para validar en local el flujo real **sin Stripe real**. Cada paso muestra un banner de éxito o error en la parte superior.

**Orden recomendado:**

| Paso | Botón | Qué ocurre | Estados resultantes | Avisos |
|------|-------|------------|---------------------|--------|
| 1 | **Crear pedido sandbox** | Checkout real con usuario seed (`laura.garcia@example.com`) y un producto publicado con stock | Pedido `PAYMENT_PENDING`, pago `PAYMENT_PENDING`, VendorOrder `PENDING` | Email comprador + email artesano (+ Telegram admin si está configurado) |
| 2 | **Simular pago OK** | Simula webhook Stripe; crea payout retenido 14 días | Pedido `PAID`, pago `PAYMENT_PAID`, payout `PENDING` + retenido | Telegram admin (pago confirmado) |
| 3 | **Confirmar + Enviar** | Como el panel productor: confirma y marca envío con tracking `SANDBOX-…` | VendorOrder `SHIPPED`, pedido `SHIPPED` | Email de envío al comprador |
| 4 | **Fast-forward retención** | Adelanta `releasesAt` al pasado; **no** libera el dinero | Payout sigue retenido, pero ya “vencido” | Solo banner en pantalla |
| 5 | **Liberar payouts** | Simula transferencia al artesano (sin llamar a Stripe) | Payout `PAID`, `heldForWithdrawal=false` | Solo banner en pantalla |
| 6 | **Marcar entregado** | Solo activo si hay líneas en `SHIPPED` | VendorOrder `DELIVERED` | Banner en pantalla |

Notas:

- «Marcar entregado» se habilita cuando el VendorOrder está en `SHIPPED` y se desactiva al pasar a `DELIVERED`.
- «Fast-forward» y «Liberar payouts» requieren un payout retenido (paso 2).
- En local, los emails se imprimen en la terminal del servidor (`[EMAIL] To: …`).
- Errores de consola del tipo *“message channel closed”* suelen ser de **extensiones del navegador**, no del marketplace.

#### 6) Plan / simulación financiera

- Panel `/admin/plan`: PyG base del plan de viabilidad + **simulador** (comisión, fijos, RETA, marketing, ticket, escala GMV) con gráficos de decisión.

#### 7) Turismo territorial (fases 2–3)

- Panel `/admin/turismo`:
  - alta de **alojamientos** (enlace de reserva Booking/web/WhatsApp, productos relacionados),
  - **cupones**,
  - **packs** (noche + lote; el lote usa productos publicados),
  - **códigos de afiliado** (`?ref=`).
- Recuerda: publicar un alojamiento no implica checkout de noches en la plataforma.

#### 8) Showroom físico y estadísticas

- **`/admin/showroom`:** simulador del punto de venta (visitas, conversión, ticket, impulso en caja, lista de 8, cestas, plan 90 días). Pasa el ratón sobre las métricas para ver definiciones (p. ej. *attach impulso* = % de tickets con producto extra en mostrador).
- **`/admin/showroom/estadisticas`:** captura operativa diaria o quincenal, **procedencia de visitantes/compradores** (formulario móvil en 10 s), sincronización desde pedidos/CRM, gráficos EDA, **informe de KPI** (tabla + glosario + descarga `.txt`) y export CSV. Guía: [`Showroom_Procedencia_Visitantes.md`](./Showroom_Procedencia_Visitantes.md).
- **`/admin/showroom/fidelizacion`:** rasca y gana, tarjeta de sellos, club WhatsApp y trae a un amigo. Guía: [`Showroom_Fidelizacion_Premios.md`](./Showroom_Fidelizacion_Premios.md).

#### 8) Programa de afiliados

- Panel `/admin/afiliados`:
  - alta por tipo (alojamiento, productor, creador, guía, embajador…),
  - enlace `?ref=CODIGO` y cookie de atribución,
  - comisión 8–10 % solo por venta confirmada,
  - ledger de comisiones y export CSV,
  - **fidelización:** KPIs trimestrales, niveles (Colaborador / Embajador / Partner), periodicidad de pago y candidatos a subir nivel,
  - simulador de margen (modelo productor + canal externo).
- Guías: [`Programa_Afiliados_Sabores_Culebra.md`](./Programa_Afiliados_Sabores_Culebra.md) · [`Modelos_Comisiones_Consolidado.md`](./Modelos_Comisiones_Consolidado.md) · [`Programa_Fidelizacion_Afiliados.md`](./Programa_Fidelizacion_Afiliados.md).

#### 9) Otros módulos de proyecto y control

| Ruta | Uso |
|------|-----|
| `/admin/config` | Redes sociales, bloques del hub de la tienda y auditoría WAI. |
| `/admin/afiliados` | Programa de afiliados y comisiones a canales externos. |
| `/admin/showroom/fidelizacion` | Fidelización en showroom (premios, sellos, club). |
| `/admin/packaging` | Frases, tags y costes de cajas kraft por tipo de cesta. |
| `/admin/raya` | Checklist documental convocatoria La Raya L1. |
| `/admin/entregables-ai` | Estado de entregables técnicos del contrato núcleo. |
| `/admin/auditoria` | Registro de acciones administrativas. |

Para moderación diaria del marketplace use **Productores**, **Productos**, **Pedidos** y **Liquidaciones** (sección Catálogo y Operaciones del mapa §A4).

