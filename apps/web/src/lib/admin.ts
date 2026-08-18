import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin(callbackUrl = "/admin") {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (!(session.user.roles ?? []).includes("ADMIN")) {
    redirect("/cuenta");
  }
  return session.user;
}
