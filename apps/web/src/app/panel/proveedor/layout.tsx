import { auth } from "@/auth";
import { VendorPayoutBanner } from "@/components/vendor/vendor-payout-notice";

export default async function ProveedorPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      {session?.user?.id ? <VendorPayoutBanner userId={session.user.id} /> : null}
      {children}
    </>
  );
}
