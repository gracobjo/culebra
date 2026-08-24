import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { getSiteSocialLinks, type SiteSocialLinksRecord } from "@culebra/auth";

function marketplaceContact() {
  const email =
    process.env.MARKETPLACE_EMAIL ??
    process.env.EMAIL_FROM ??
    "info@saboresdelaculebra.es";
  const address =
    process.env.MARKETPLACE_ADDRESS ??
    "Villardeciervos, Zamora, España";
  const phone = process.env.MARKETPLACE_PHONE ?? null;

  return { email, address, phone };
}

export default async function ContactoPage() {
  const socials: SiteSocialLinksRecord | null = await getSiteSocialLinks();
  const { email, address, phone } = marketplaceContact();

  return (
    <PageShell width="lg">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Contacto" },
        ]}
      />

      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Hablemos</h1>
      <p className="mt-4 max-w-2xl text-stone-600">
        Consultas de clientes, altas de proveedores y colaboraciones institucionales.
      </p>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Sede</p>
          <p className="mt-3 text-sm font-medium text-stone-900">{address}</p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Correo</p>
          <Link href={`mailto:${email}`} className="mt-3 block text-sm font-medium text-stone-900">
            {email}
          </Link>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Teléfono</p>
          <p className="mt-3 text-sm font-medium text-stone-900">
            {phone ? (
              <a href={`tel:${phone}`}>{phone}</a>
            ) : (
              "Pendiente de alta"
            )}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Redes</h2>
        <p className="mt-2 text-sm text-stone-600">
          Enlaces configurados desde el admin.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {socials?.facebookUrl ? (
            <Link
              href={socials.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-stone-900 border border-stone-200 hover:border-emerald-600"
            >
              Facebook
            </Link>
          ) : null}
          {socials?.instagramUrl ? (
            <Link
              href={socials.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-stone-900 border border-stone-200 hover:border-emerald-600"
            >
              Instagram
            </Link>
          ) : null}
          {socials?.whatsappUrl ? (
            <Link
              href={socials.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-stone-900 border border-stone-200 hover:border-emerald-600"
            >
              WhatsApp
            </Link>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}

