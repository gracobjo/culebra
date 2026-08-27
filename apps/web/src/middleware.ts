import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/cuenta", "/panel/proveedor", "/admin"];

const SESSION_COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "__Host-authjs.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
] as const;

function requiresAuth(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

/** Evita getToken() en Edge (jose/CompressionStream rompe y parece “sin sesión”). */
function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

function parseOriginHost(origin: string): string {
  try {
    if (origin.includes("://")) {
      return new URL(origin).host;
    }
    return origin.split("/")[0] ?? origin;
  } catch {
    return origin;
  }
}

/** En Codespaces el proxy pone x-forwarded-host distinto del origin (localhost). */
function alignForwardedHostHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  const inCodespace = Boolean(process.env.CODESPACE_NAME);
  const allowAlign =
    process.env.NODE_ENV !== "production" ||
    inCodespace ||
    process.env.ALIGN_FORWARDED_HOST === "true";

  if (!allowAlign) {
    return headers;
  }

  const origin = headers.get("origin");
  const forwardedHost = headers.get("x-forwarded-host");
  if (!origin || !forwardedHost) {
    return headers;
  }

  const originHost = parseOriginHost(origin);
  if (originHost && originHost !== forwardedHost) {
    headers.set("x-forwarded-host", originHost);
  }

  return headers;
}

export async function middleware(request: NextRequest) {
  const requestHeaders = alignForwardedHostHeaders(request);
  const pathname = request.nextUrl.pathname;
  const ref = request.nextUrl.searchParams.get("ref");

  if (requiresAuth(pathname) && !hasSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (ref && /^[A-Za-z0-9_-]{2,40}$/.test(ref)) {
    response.cookies.set("culebra_ref", ref.toUpperCase(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
