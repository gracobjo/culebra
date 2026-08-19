import { purgeExpiredStoredDocuments } from "@culebra/auth";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const purged = await purgeExpiredStoredDocuments();
  return Response.json({ ok: true, purged });
}
