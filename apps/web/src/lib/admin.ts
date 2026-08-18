import { getActiveUserById } from "@culebra/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { assertSameOriginRequest } from "@/lib/security";

export async function requireAdmin(callbackUrl = "/admin") {
  await assertSameOriginRequest();

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const user = await getActiveUserById(session.user.id);
  if (!user) {
    redirect("/login?error=account_suspended");
  }

  if (!user.roles.includes("ADMIN")) {
    redirect("/cuenta");
  }

  return user;
}
