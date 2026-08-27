import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { VendorPayoutBanner } from "@/components/vendor/vendor-payout-notice";

export default async function ProveedorPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fpanel%2Fproveedor");
  }
  const roles = session.user.roles ?? [];
  if (!roles.includes("VENDOR") && !roles.includes("ADMIN")) {
    redirect("/cuenta");
  }

  return (
    <>
      {session.user.id ? <VendorPayoutBanner userId={session.user.id} /> : null}
      {children}
    </>
  );
}
