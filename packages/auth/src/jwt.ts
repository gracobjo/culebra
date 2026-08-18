import { SignJWT, jwtVerify } from "jose";

import type { AuthUser, JwtPayload } from "./types.js";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.includes("[REEMPLAZAR")) {
    throw new Error("AUTH_SECRET no configurado correctamente");
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(user: AuthUser): Promise<string> {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }

    const roles = Array.isArray(payload.roles)
      ? payload.roles.filter((role): role is JwtPayload["roles"][number] =>
          typeof role === "string",
        )
      : [];

    return {
      sub: payload.sub,
      email: payload.email,
      roles,
    };
  } catch {
    return null;
  }
}
