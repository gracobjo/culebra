import { auth } from "@/auth";
import { loadCart } from "@/app/carrito/actions";
import { MobileTabBar } from "./mobile-tab-bar";
import { SiteFooter } from "./site-footer";
import { SiteHeaderNav } from "./site-header-nav";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cart = await loadCart();
  const isLoggedIn = Boolean(session?.user);

  return (
    <>
      <SiteHeaderNav cartCount={cart.itemCount} isLoggedIn={isLoggedIn} />
      <div className="flex min-h-0 flex-1 flex-col pb-20 lg:pb-0">
        {children}
        <SiteFooter />
      </div>
      <MobileTabBar cartCount={cart.itemCount} isLoggedIn={isLoggedIn} />
    </>
  );
}
