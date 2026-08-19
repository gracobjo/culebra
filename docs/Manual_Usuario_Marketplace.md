# Manual de Usuario — Marketplace Villardeciervos

> Basado en las funcionalidades implementadas del marketplace (Villardeciervos).

---

## A. Manual de Usuario (Consumidor / Productor / Admin)

### A1. Acceso, roles y seguridad

La aplicación usa autenticación con roles:

- **CONSUMER**: comprador final (navega, compra, paga, recibe notificaciones, deja reviews).
- **VENDOR**: productor/artesano (recibe pedidos, confirma preparación, marca envío/entrega).
- **ADMIN**: supervisa KPIs, liquidaciones, rentabilidad, rappels, grupo piloto y sandbox.

Rutas típicas:

- Inicio: `/`
- Categorías: `/categorias`
- Cuenta: `/cuenta`
- Login/Register: `/login`, `/register`
- Carrito: `/carrito`
- Pedido (detalle): `/pedido/[orderNumber]`
- Panel productor: `/panel/proveedor/*`
- Panel admin: `/admin/*`

---

### A2. Funcionalidades del Consumidor

#### 1) Navegar catálogo unificado

- Explora categorías y productos.
- Los productos pueden pertenecer a **diferentes productores**.

#### 2) Carrito multi-proveedor

- Añade productos.
- El sistema prepara el pedido agregando vendedores implicados.

#### 3) Checkout y pago avanzado (Stripe Connect + Bizum)

- El comprador paga mediante checkout.
- Se habilitan métodos: tarjeta + **Bizum** (y wallets si aplica).
- La pasarela gestiona el **split automático** (comisión marketplace + neto del productor).

#### 4) Estado del pedido y notificaciones

- Tras el pedido, el sistema muestra el estado (pendiente de pago, pagado, envío, etc.).
- Se envían emails:
  - **Confirmación de pedido** (al comprador, best-effort).
  - **Aviso de envío** (cuando el productor marca el pedido como enviado).

#### 5) Reviews post-compra (opcional pero habilitadas)

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

