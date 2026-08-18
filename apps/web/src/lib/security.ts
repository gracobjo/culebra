import { headers } from "next/headers";

export async function assertSameOriginRequest() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (!origin) {
    return;
  }

  const allowedOrigin =
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    `http://${headerList.get("host") ?? "localhost:3000"}`;

  if (origin !== allowedOrigin) {
    throw new Error("FORBIDDEN_ORIGIN");
  }
}
