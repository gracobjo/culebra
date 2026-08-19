import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPrefixes = ["/cuenta", "/panel/proveedor", "/admin"];

function requiresAuth(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
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

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (!token && requiresAuth(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token?.status && token.status !== "ACTIVE" && requiresAuth(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "account_suspended");
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && token) {
    const roles = (token.roles as string[] | undefined) ?? [];
    if (!roles.includes("ADMIN")) {
      return NextResponse.redirect(new URL("/cuenta", request.url));
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
