type HttpMethod = "get" | "post" | "patch" | "delete";

type OperationOptions = {
  summary: string;
  description?: string;
  tags: string[];
  security?: unknown;
  parameters?: Array<Record<string, unknown>>;
  requestBody?: Record<string, unknown>;
  responses?: Record<string, Record<string, unknown>>;
};

const jsonBody = (description: string, example?: Record<string, unknown>) => ({
  required: true,
  content: {
    "application/json": {
      schema: { type: "object" as const },
      ...(example ? { example } : {}),
    },
  },
  description,
});

const jsonResponse = (description: string, status = "200") => ({
  [status]: {
    description,
    content: {
      "application/json": {
        schema: { type: "object" },
      },
    },
  },
});

const errorResponses = {
  "400": { description: "Error de validacion (VALIDATION_ERROR)" },
  "401": { description: "No autenticado" },
  "403": { description: "Acceso denegado" },
  "404": { description: "Recurso no encontrado" },
  "409": { description: "Conflicto de estado" },
  "500": { description: "Error interno" },
};

function pathParams(...names: string[]) {
  return names.map((name) => ({
    name,
    in: "path" as const,
    required: true,
    schema: { type: "string" },
  }));
}

function queryParams(params: Record<string, string>) {
  return Object.entries(params).map(([name, description]) => ({
    name,
    in: "query" as const,
    required: false,
    schema: { type: "string" },
    description,
  }));
}

const authSecurity = [{ bearerAuth: [] as string[] }, { cookieAuth: [] as string[] }];
const adminSecurity = [{ bearerAuth: [] as string[] }, { cookieAuth: [] as string[] }];
const vendorSecurity = [{ bearerAuth: [] as string[] }, { cookieAuth: [] as string[] }];

function addPath(
  paths: Record<string, Record<string, unknown>>,
  route: string,
  method: HttpMethod,
  options: OperationOptions,
) {
  paths[route] = {
    ...(paths[route] ?? {}),
    [method]: {
      summary: options.summary,
      ...(options.description ? { description: options.description } : {}),
      tags: options.tags,
      ...(options.security ? { security: options.security } : {}),
      ...(options.parameters ? { parameters: options.parameters } : {}),
      ...(options.requestBody ? { requestBody: options.requestBody } : {}),
      responses: options.responses ?? jsonResponse("Respuesta correcta"),
    },
  };
}

function buildPaths() {
  const paths: Record<string, Record<string, unknown>> = {};
  const add = (route: string, method: HttpMethod, options: OperationOptions) =>
    addPath(paths, route, method, options);

  add("/health", "get", {
    tags: ["Sistema"],
    summary: "Estado del servicio",
    description: "Comprueba conectividad con la base de datos.",
    responses: jsonResponse("Estado del servicio y base de datos"),
  });

  add("/auth/register", "post", {
    tags: ["Autenticacion"],
    summary: "Registro de consumidor",
    requestBody: jsonBody("Datos de registro", {
      email: "user@example.com",
      password: "Password1",
      firstName: "Ana",
    }),
    responses: {
      "201": { description: "Usuario creado; establece cookie de sesion" },
      "400": errorResponses["400"],
      "401": errorResponses["401"],
      "500": errorResponses["500"],
      "409": { description: "EMAIL_ALREADY_EXISTS" },
    },
  });

  add("/auth/login", "post", {
    tags: ["Autenticacion"],
    summary: "Inicio de sesion",
    requestBody: jsonBody("Credenciales", {
      email: "user@example.com",
      password: "Password1",
    }),
    responses: {
      "200": { description: "Sesion iniciada; devuelve user y accessToken" },
      "401": { description: "INVALID_CREDENTIALS" },
    },
  });

  add("/auth/logout", "post", {
    tags: ["Autenticacion"],
    summary: "Cierre de sesion",
    security: authSecurity,
    responses: jsonResponse("Sesion cerrada"),
  });

  add("/auth/me", "get", {
    tags: ["Autenticacion"],
    summary: "Usuario autenticado",
    security: authSecurity,
    responses: jsonResponse("Perfil del usuario en sesion"),
  });

  add("/auth/password-reset/request", "post", {
    tags: ["Autenticacion"],
    summary: "Solicitud de restablecimiento de contrasena",
    requestBody: jsonBody("Email", { email: "user@example.com" }),
    responses: jsonResponse("Solicitud aceptada"),
  });

  add("/admin/status", "get", {
    tags: ["RBAC"],
    summary: "Comprobacion de rol ADMIN",
    security: adminSecurity,
    responses: jsonResponse("Scope admin"),
  });

  add("/vendor/status", "get", {
    tags: ["RBAC"],
    summary: "Comprobacion de rol VENDOR",
    security: vendorSecurity,
    responses: jsonResponse("Scope vendor"),
  });

  add("/consumer/status", "get", {
    tags: ["RBAC"],
    summary: "Comprobacion de rol CONSUMER",
    security: authSecurity,
    responses: jsonResponse("Scope consumer"),
  });

  add("/vendors", "get", {
    tags: ["Productores"],
    summary: "Listado publico de productores",
    parameters: queryParams({
      search: "Busqueda",
      province: "Provincia",
      limit: "Limite",
      offset: "Offset",
    }),
    responses: jsonResponse("Listado paginado"),
  });

  add("/vendors/{slug}", "get", {
    tags: ["Productores"],
    summary: "Ficha publica de productor",
    parameters: pathParams("slug"),
    responses: {
      "200": { description: "Productor encontrado" },
      "404": { description: "VENDOR_NOT_FOUND" },
    },
  });

  add("/vendors/apply", "post", {
    tags: ["Productores"],
    summary: "Solicitar alta como productor",
    security: authSecurity,
    requestBody: jsonBody("Datos de solicitud"),
    responses: { "201": { description: "Solicitud registrada" }, ...errorResponses },
  });

  add("/vendors/me/profile", "get", {
    tags: ["Productores"],
    summary: "Perfil del productor autenticado",
    security: vendorSecurity,
    responses: jsonResponse("Perfil del vendor"),
  });

  add("/vendors/me/profile", "patch", {
    tags: ["Productores"],
    summary: "Actualizar perfil de productor",
    security: vendorSecurity,
    requestBody: jsonBody("Campos del perfil"),
    responses: jsonResponse("Perfil actualizado"),
  });

  add("/vendors/me/submit", "post", {
    tags: ["Productores"],
    summary: "Enviar perfil a revision",
    security: vendorSecurity,
    responses: jsonResponse("Perfil enviado"),
  });

  add("/admin/vendors", "get", {
    tags: ["Admin - Productores"],
    summary: "Listado de productores (admin)",
    security: adminSecurity,
    parameters: queryParams({ status: "Estado", limit: "Limite", offset: "Offset" }),
    responses: jsonResponse("Listado admin"),
  });

  add("/admin/vendors/{id}/status", "patch", {
    tags: ["Admin - Productores"],
    summary: "Cambiar estado de productor",
    security: adminSecurity,
    parameters: pathParams("id"),
    requestBody: jsonBody("Nuevo estado", { status: "ACTIVE" }),
    responses: jsonResponse("Vendor actualizado"),
  });

  add("/categories", "get", {
    tags: ["Catalogo"],
    summary: "Listado de categorias",
    responses: jsonResponse("Arbol de categorias"),
  });

  add("/products", "get", {
    tags: ["Catalogo"],
    summary: "Catalogo publico de productos",
    parameters: queryParams({
      search: "Texto",
      categorySlug: "Categoria",
      vendorSlug: "Productor",
      minPrice: "Precio min",
      maxPrice: "Precio max",
      limit: "Limite",
      offset: "Offset",
    }),
    responses: jsonResponse("Productos publicados"),
  });

  add("/products/{slug}", "get", {
    tags: ["Catalogo"],
    summary: "Detalle publico de producto",
    parameters: pathParams("slug"),
    responses: {
      "200": { description: "Producto encontrado" },
      "404": { description: "PRODUCT_NOT_FOUND" },
    },
  });

  add("/vendors/me/products", "get", {
    tags: ["Productos - Productor"],
    summary: "Productos del productor",
    security: vendorSecurity,
    responses: jsonResponse("Listado propio"),
  });

  add("/vendors/me/products/{id}", "get", {
    tags: ["Productos - Productor"],
    summary: "Detalle de producto propio",
    security: vendorSecurity,
    parameters: pathParams("id"),
    responses: jsonResponse("Producto"),
  });

  add("/vendors/me/products", "post", {
    tags: ["Productos - Productor"],
    summary: "Crear producto",
    security: vendorSecurity,
    requestBody: jsonBody("Datos del producto"),
    responses: { "201": { description: "Producto creado" }, ...errorResponses },
  });

  add("/vendors/me/products/{id}", "patch", {
    tags: ["Productos - Productor"],
    summary: "Actualizar producto",
    security: vendorSecurity,
    parameters: pathParams("id"),
    requestBody: jsonBody("Campos a actualizar"),
    responses: jsonResponse("Producto actualizado"),
  });

  add("/vendors/me/products/{id}/submit", "post", {
    tags: ["Productos - Productor"],
    summary: "Enviar producto a revision",
    security: vendorSecurity,
    parameters: pathParams("id"),
    responses: jsonResponse("Enviado a revision"),
  });

  add("/vendors/me/products/{id}/disable", "post", {
    tags: ["Productos - Productor"],
    summary: "Desactivar producto",
    security: vendorSecurity,
    parameters: pathParams("id"),
    responses: jsonResponse("Producto desactivado"),
  });

  add("/admin/products", "get", {
    tags: ["Admin - Catalogo"],
    summary: "Listado de productos (admin)",
    security: adminSecurity,
    parameters: queryParams({ status: "Estado", limit: "Limite", offset: "Offset" }),
    responses: jsonResponse("Productos para moderacion"),
  });

  add("/admin/products/{id}/status", "patch", {
    tags: ["Admin - Catalogo"],
    summary: "Moderar producto",
    security: adminSecurity,
    parameters: pathParams("id"),
    requestBody: jsonBody("Estado y motivo opcional"),
    responses: jsonResponse("Producto moderado"),
  });

  add("/cart", "get", {
    tags: ["Carrito"],
    summary: "Obtener carrito",
    description: "Usuario logueado o invitado con cookie culebra_cart.",
    security: [{ cookieAuth: [] as string[] }],
    responses: jsonResponse("Carrito actual"),
  });

  add("/cart/items", "post", {
    tags: ["Carrito"],
    summary: "Anadir linea al carrito",
    security: [{ cookieAuth: [] as string[] }],
    requestBody: jsonBody("productId, variantId opcional, quantity"),
    responses: { "201": { description: "Linea anadida" }, ...errorResponses },
  });

  add("/cart/items/{id}", "patch", {
    tags: ["Carrito"],
    summary: "Actualizar cantidad",
    security: [{ cookieAuth: [] as string[] }],
    parameters: pathParams("id"),
    requestBody: jsonBody("quantity"),
    responses: jsonResponse("Carrito actualizado"),
  });

  add("/cart/items/{id}", "delete", {
    tags: ["Carrito"],
    summary: "Eliminar linea",
    security: [{ cookieAuth: [] as string[] }],
    parameters: pathParams("id"),
    responses: jsonResponse("Carrito actualizado"),
  });

  add("/checkout", "post", {
    tags: ["Carrito"],
    summary: "Confirmar compra",
    security: [{ cookieAuth: [] as string[] }],
    requestBody: jsonBody("Envio, facturacion y cliente"),
    responses: { "201": { description: "Pedido creado" }, ...errorResponses },
  });

  add("/orders", "get", {
    tags: ["Pedidos"],
    summary: "Pedidos del consumidor",
    security: authSecurity,
    responses: jsonResponse("Historial"),
  });

  add("/orders/{orderNumber}", "get", {
    tags: ["Pedidos"],
    summary: "Detalle de pedido",
    security: authSecurity,
    parameters: pathParams("orderNumber"),
    responses: jsonResponse("Pedido"),
  });

  add("/orders/lookup", "post", {
    tags: ["Pedidos"],
    summary: "Consulta invitado",
    requestBody: jsonBody("orderNumber y email"),
    responses: jsonResponse("Pedido si coincide email"),
  });

  add("/vendors/me/orders", "get", {
    tags: ["Pedidos - Productor"],
    summary: "Subpedidos del productor",
    security: vendorSecurity,
    responses: jsonResponse("VendorOrders"),
  });

  add("/vendors/me/orders/{id}", "get", {
    tags: ["Pedidos - Productor"],
    summary: "Detalle subpedido",
    security: vendorSecurity,
    parameters: pathParams("id"),
    responses: jsonResponse("VendorOrder"),
  });

  add("/vendors/me/orders/{id}/status", "patch", {
    tags: ["Pedidos - Productor"],
    summary: "Actualizar estado",
    security: vendorSecurity,
    parameters: pathParams("id"),
    requestBody: jsonBody("status"),
    responses: jsonResponse("Actualizado"),
  });

  add("/vendors/me/orders/{id}/ship", "post", {
    tags: ["Pedidos - Productor"],
    summary: "Registrar envio",
    security: vendorSecurity,
    parameters: pathParams("id"),
    requestBody: jsonBody("carrier, trackingNumber"),
    responses: jsonResponse("Envio registrado"),
  });

  add("/orders/{orderNumber}/pay", "post", {
    tags: ["Pagos"],
    summary: "Sesion Stripe Checkout",
    security: authSecurity,
    parameters: pathParams("orderNumber"),
    responses: jsonResponse("URL de pago"),
  });

  add("/vendors/me/stripe", "get", {
    tags: ["Pagos"],
    summary: "Estado Stripe Connect",
    security: vendorSecurity,
    responses: jsonResponse("Estado onboarding"),
  });

  add("/vendors/me/stripe/onboard", "post", {
    tags: ["Pagos"],
    summary: "Enlace onboarding Stripe",
    security: vendorSecurity,
    responses: jsonResponse("URL onboarding"),
  });

  add("/webhooks/stripe", "post", {
    tags: ["Pagos"],
    summary: "Webhook Stripe",
    description: "Body raw JSON firmado con stripe-signature.",
    responses: jsonResponse("Evento procesado"),
  });

  add("/vendors/me/contracts", "get", {
    tags: ["Contratos"],
    summary: "Estado contractual",
    security: vendorSecurity,
    responses: jsonResponse("Contrato activo"),
  });

  add("/vendors/me/contracts/versions/{versionId}/accept", "post", {
    tags: ["Contratos"],
    summary: "Aceptar contrato",
    security: vendorSecurity,
    parameters: pathParams("versionId"),
    responses: jsonResponse("Aceptado"),
  });

  add("/admin/contracts", "get", {
    tags: ["Admin - Contratos"],
    summary: "Listado contratos",
    security: adminSecurity,
    parameters: queryParams({ vendorId: "Vendor", status: "Estado", limit: "Limite", offset: "Offset" }),
    responses: jsonResponse("Contratos"),
  });

  add("/admin/contracts/{id}", "get", {
    tags: ["Admin - Contratos"],
    summary: "Detalle contrato",
    security: adminSecurity,
    parameters: pathParams("id"),
    responses: jsonResponse("Contrato"),
  });

  add("/admin/vendors/{vendorId}/contracts/versions", "post", {
    tags: ["Admin - Contratos"],
    summary: "Crear version de contrato",
    security: adminSecurity,
    parameters: pathParams("vendorId"),
    requestBody: jsonBody("Condiciones"),
    responses: { "201": { description: "Version creada" } },
  });

  add("/admin/contracts/{contractId}/versions/{versionId}/publish", "post", {
    tags: ["Admin - Contratos"],
    summary: "Publicar version",
    security: adminSecurity,
    parameters: pathParams("contractId", "versionId"),
    responses: jsonResponse("Publicada"),
  });

  add("/vendors/me/commission-rules", "get", {
    tags: ["Comisiones"],
    summary: "Reglas de comision del productor",
    security: vendorSecurity,
    responses: jsonResponse("Reglas"),
  });

  add("/vendors/me/payouts", "get", {
    tags: ["Comisiones"],
    summary: "Liquidaciones del productor",
    security: vendorSecurity,
    parameters: queryParams({ status: "Estado", limit: "Limite", offset: "Offset" }),
    responses: jsonResponse("Payouts"),
  });

  add("/vendors/me/payouts/retry", "post", {
    tags: ["Comisiones"],
    summary: "Reintentar payouts",
    security: vendorSecurity,
    responses: jsonResponse("Resultado"),
  });

  add("/admin/vendors/{vendorId}/commission-rules", "get", {
    tags: ["Admin - Comisiones"],
    summary: "Reglas de un productor",
    security: adminSecurity,
    parameters: pathParams("vendorId"),
    responses: jsonResponse("Reglas"),
  });

  add("/admin/vendors/{vendorId}/commission-rules", "post", {
    tags: ["Admin - Comisiones"],
    summary: "Crear regla de comision",
    security: adminSecurity,
    parameters: pathParams("vendorId"),
    requestBody: jsonBody("Tipo, porcentaje, vigencia"),
    responses: { "201": { description: "Regla creada" } },
  });

  add("/admin/payouts", "get", {
    tags: ["Admin - Comisiones"],
    summary: "Liquidaciones globales",
    security: adminSecurity,
    parameters: queryParams({
      vendorId: "Vendor",
      status: "Estado",
      limit: "Limite",
      offset: "Offset",
    }),
    responses: jsonResponse("Payouts admin"),
  });

  add("/admin/dashboard", "get", {
    tags: ["Admin"],
    summary: "KPIs del panel",
    security: adminSecurity,
    responses: jsonResponse("Estadisticas"),
  });

  add("/admin/users", "get", {
    tags: ["Admin"],
    summary: "Listado de usuarios",
    security: adminSecurity,
    parameters: queryParams({ limit: "Limite", offset: "Offset" }),
    responses: jsonResponse("Usuarios"),
  });

  add("/admin/users/{id}/status", "patch", {
    tags: ["Admin"],
    summary: "Activar o suspender usuario",
    security: adminSecurity,
    parameters: pathParams("id"),
    requestBody: jsonBody("status ACTIVE | SUSPENDED"),
    responses: jsonResponse("Usuario actualizado"),
  });

  add("/admin/orders", "get", {
    tags: ["Admin"],
    summary: "Listado de pedidos",
    security: adminSecurity,
    parameters: queryParams({ status: "Estado", limit: "Limite", offset: "Offset" }),
    responses: jsonResponse("Pedidos"),
  });

  add("/admin/orders/{orderNumber}", "get", {
    tags: ["Admin"],
    summary: "Detalle pedido admin",
    security: adminSecurity,
    parameters: pathParams("orderNumber"),
    responses: jsonResponse("Pedido"),
  });

  add("/admin/audit-logs", "get", {
    tags: ["Admin"],
    summary: "Auditoria",
    security: adminSecurity,
    parameters: queryParams({
      entityType: "Entidad",
      action: "Accion",
      limit: "Limite",
      offset: "Offset",
    }),
    responses: jsonResponse("Logs"),
  });

  return paths;
}

export function buildOpenApiSpec(port: number) {
  return {
    openapi: "3.0.3" as const,
    info: {
      title: "Sabores de la Culebra — API REST",
      version: "0.1.0",
      description: [
        "API REST del marketplace **Sabores de la Culebra**.",
        "",
        "Autenticacion:",
        "- Cookie `culebra_session` (login/register)",
        "- Header `Authorization: Bearer <accessToken>`",
      ].join("\n"),
    },
    servers: [{ url: `http://localhost:${port}`, description: "Desarrollo local" }],
    tags: [
      { name: "Sistema" },
      { name: "Autenticacion" },
      { name: "RBAC" },
      { name: "Productores" },
      { name: "Admin - Productores" },
      { name: "Catalogo" },
      { name: "Productos - Productor" },
      { name: "Admin - Catalogo" },
      { name: "Carrito" },
      { name: "Pedidos" },
      { name: "Pedidos - Productor" },
      { name: "Pagos" },
      { name: "Contratos" },
      { name: "Admin - Contratos" },
      { name: "Comisiones" },
      { name: "Admin - Comisiones" },
      { name: "Admin" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http" as const,
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey" as const,
          in: "cookie" as const,
          name: "culebra_session",
        },
      },
    },
    paths: buildPaths(),
  };
}
