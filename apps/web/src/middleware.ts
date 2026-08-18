import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPrefixes = ["/cuenta", "/panel/proveedor", "/admin"];

function requiresAuth(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/cuenta/:path*", "/panel/proveedor/:path*", "/admin/:path*"],
};
