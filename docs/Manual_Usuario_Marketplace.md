# Manual de Usuario — Marketplace Villardeciervos

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)

> Basado en las funcionalidades implementadas del marketplace (Villardeciervos).

**Documentos relacionados:** [Requisitos y casos de uso](./Requisitos_Funcionales_NoFuncionales_UseCases_UML.md) · [Turismo (fases 2–3)](./tourism.md) · [Catálogo](./catalog.md) · [Carrito](./cart.md)

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
                   · 15% → comisión del marketplace (S.L.)
                   · 85% → payout del productor artesano
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
| Comisión marketplace (15%) | 50 × 0,15 | −7,50 € |
| **Payout neto al productor** | 50 − 1,00 − 7,50 | **41,50 €** |

##### Ejemplo real — Bizum

> Cesta de **50,00 €** pagada con Bizum.

| Concepto | Cálculo | Importe |
|---|---|---:|
| Importe pagado por el cliente | — | 50,00 € |
| Comisión Stripe Bizum (0,8% + 0,25 €) | 50 × 0,008 + 0,25 | −0,65 € |
| Comisión marketplace (15%) | 50 × 0,15 | −7,50 € |
| **Payout neto al productor** | 50 − 0,65 − 7,50 | **41,85 €** |

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
   - `/panel/proveedor/productos`
   - pulsa **“Nuevo producto”**.
2. Rellena los datos requeridos:
   - `Nombre`
   - `Categoría`
   - `Precio (EUR)`
3. (Opcional) Sube la foto del producto.
   - Si no subes foto, el sistema muestra un PNG por defecto según la categoría.
4. Pulsa **“Crear producto”**.
   - El producto se guarda inicialmente en `DRAFT`.
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

**Comisión del marketplace:** por defecto la plataforma retiene un **15 %** del bruto de tus ventas. El administrador puede acordar otro porcentaje (subir o bajar) en tu ficha de productor; los cambios solo afectan a pedidos nuevos.

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

#### 1) KPIs para evaluar desempeño

- Panel `/admin/kpis` con objetivos y niveles (OK/WARNING/CRITICAL).

#### 2) Rentabilidad por transacción

- Panel `/admin/rentabilidad`: ingresa comisiones, calcula costes imputables (amortización, envasado, transporte, cloud/gestoría), y muestra beneficio neto.

#### 3) Rappels por productor / por tramo

- Panel `/admin/rappels`: calcula tramos por facturación anual y “rappel” anual (abono teórico).

#### 4) Grupo Piloto (Mes 2–6)

- Panel `/admin/piloto`:
  - gestión de 5 productores piloto,
  - checklist por fase (selección, captación puerta a puerta, beta/ensayo),
  - estado del onboarding (y tareas por productor).

#### 5) Sandbox (validación rápida end-to-end)

- Panel `/admin/sandbox`:
  - crea un pedido sandbox (listo para pago),
  - simula pago OK sin Stripe real,
  - simula confirmación + envío por productor,
  - fast-forward retención de payouts,
  - libera payouts en modo sandbox,
  - marca entregado.

#### 6) Turismo territorial (fases 2–3)

- Panel `/admin/turismo`:
  - alta de **alojamientos** (enlace de reserva Booking/web/WhatsApp, productos relacionados),
  - **cupones**,
  - **packs** (noche + lote; el lote usa productos publicados),
  - **códigos de afiliado** (`?ref=`).
- Recuerda: publicar un alojamiento no implica checkout de noches en la plataforma.

