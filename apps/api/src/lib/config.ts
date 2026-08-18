export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "culebra_session",
  isProduction: process.env.NODE_ENV === "production",
};
