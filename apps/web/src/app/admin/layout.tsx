import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { privateAreaMetadata } from "@/lib/site";
import { auth } from "@/auth";

export const metadata: Metadata = privateAreaMetadata;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fadmin");
  }
  if (!session.user.roles?.includes("ADMIN")) {
    redirect("/cuenta");
  }
  return children;
}
