import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fcuenta");
  }
  if (session.user.status && session.user.status !== "ACTIVE") {
    redirect("/login?error=account_suspended");
  }
  return children;
}
