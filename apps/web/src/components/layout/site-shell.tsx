import { auth } from "@/auth";
import { loadCart } from "@/app/carrito/actions";
import { MobileTabBar } from "./mobile-tab-bar";
import { SiteFooter } from "./site-footer";
import { SiteHeaderNav } from "./site-header-nav";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cart = await loadCart();
  const isLoggedIn = Boolean(session?.user);
  const isAdmin = Boolean(session?.user?.roles?.includes("ADMIN"));
  const user = session?.user
    ? {
        name: session.user.name ?? session.user.email?.split("@")[0] ?? "Usuario",
        email: session.user.email ?? "",
        roles: session.user.roles ?? [],
      }
    : null;

  return (
    <>
      <SiteHeaderNav cartCount={cart.itemCount} isLoggedIn={isLoggedIn} isAdmin={isAdmin} user={user} />
      <div className="flex min-h-0 flex-1 flex-col pb-20 lg:pb-0">
        {children}
        <SiteFooter />
      </div>
      <MobileTabBar cartCount={cart.itemCount} isLoggedIn={isLoggedIn} user={user} />
    </>
  );
}
