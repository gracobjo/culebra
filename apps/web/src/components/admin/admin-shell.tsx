import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/layout/page-shell";
import { AdminNav } from "@/components/admin/admin-nav";

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PageShell width="full">
      <div className="flex items-center gap-4">
        <Link href="/" aria-label="Sabores de la Culebra — Inicio">
          <Image
            src="/logo.png"
            alt="Sabores de la Culebra"
            width={80}
            height={80}
            className="h-14 w-auto"
            priority
          />
        </Link>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
            Panel administracion
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</h1>
        </div>
      </div>
      <AdminNav />
      <div className="mt-8">{children}</div>
    </PageShell>
  );
}
