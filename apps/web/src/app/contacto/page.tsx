import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { SocialNetworkLinks } from "@/components/layout/social-network-links";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { getSiteSocialLinks } from "@culebra/auth";

export const metadata = { title: "Contacto" };

function marketplaceContact() {
  const email =
    process.env.MARKETPLACE_EMAIL ??
    process.env.EMAIL_FROM ??
    "info@saboresdelaculebra.es";
  const address = process.env.MARKETPLACE_ADDRESS ?? "Villardeciervos, Zamora, España";
  const phone = process.env.MARKETPLACE_PHONE ?? null;

  return { email, address, phone };
}

export default async function ContactoPage() {
  const socials = await getSiteSocialLinks();
  const { email, address, phone } = marketplaceContact();
  const hasSocials = Boolean(
    socials?.facebookUrl || socials?.instagramUrl || socials?.whatsappUrl,
  );

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
            {phone ? <a href={`tel:${phone}`}>{phone}</a> : "Pendiente de alta"}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Redes</h2>
        {hasSocials ? (
          <>
            <p className="mt-2 text-sm text-stone-600">Facebook, Instagram y WhatsApp del marketplace.</p>
            <div className="mt-5">
              <SocialNetworkLinks socials={socials} />
            </div>
          </>
        ) : (
          <p className="mt-2 max-w-xl text-sm text-stone-600">
            Aún no hay perfiles públicos configurados. Escríbenos a{" "}
            <Link href={`mailto:${email}`} className="font-medium text-emerald-800 underline">
              {email}
            </Link>{" "}
            o usa{" "}
            <Link href="/quiero-vender" className="font-medium text-emerald-800 underline">
              Quiero vender
            </Link>{" "}
            si eres productor.
          </p>
        )}
      </section>
    </PageShell>
  );
}
