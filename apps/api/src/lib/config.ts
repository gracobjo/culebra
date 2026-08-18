export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "culebra_session",
  cartCookieName: process.env.CART_COOKIE_NAME ?? "culebra_cart",
  isProduction: process.env.NODE_ENV === "production",
  trustProxy: process.env.TRUST_PROXY === "true" || process.env.NODE_ENV === "production",
  rateLimitGlobalMax: Number(process.env.RATE_LIMIT_GLOBAL_MAX ?? 100),
  rateLimitAuthMax: Number(process.env.RATE_LIMIT_AUTH_MAX ?? 10),
  rateLimitCartMax: Number(process.env.RATE_LIMIT_CART_MAX ?? 40),
  rateLimitAdminMax: Number(process.env.RATE_LIMIT_ADMIN_MAX ?? 60),
};
