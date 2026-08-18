import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { TrustStrip } from "@/components/ux/trust-strip";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: `Como funciona | ${siteConfig.shortName}`,
  description: "Guia de compra, pago, envio y seguimiento en el marketplace.",
};

export default function HowItWorksPage() {
  return (
    <PageShell width="lg">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Como funciona" }]} />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Como funciona</h1>
      <p className="mt-4 max-w-2xl text-stone-600">
        Un marketplace multi-vendedor: compras un solo pedido, pero cada productor
        prepara y envia su parte.
      </p>

      <section className="mt-10 space-y-8">
        {[
          {
            title: "1. Explora y elige",
            body: "Navega por categorias, productores o busca por nombre. Cada ficha muestra origen, alergenos y condiciones solo si el productor las ha indicado.",
          },
          {
            title: "2. Carrito y checkout",
            body: "Anade productos de uno o varios productores. Puedes comprar como invitado o con cuenta. En el checkout indicas direccion de envio y contacto.",
          },
          {
            title: "3. Pago seguro",
            body: "Si Stripe esta configurado, pagas en una pasarela segura. Recibes confirmacion y puedes consultar el pedido con numero y email.",
          },
          {
            title: "4. Preparacion y envio",
            body: "Cada productor gestiona su subpedido: confirma, prepara y registra el envio. Recibiras el seguimiento cuando el productor lo indique.",
          },
        ].map((block) => (
          <article key={block.title} className="rounded-3xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold">{block.title}</h2>
            <p className="mt-3 text-stone-700">{block.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-10">
        <TrustStrip />
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/productos"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
        >
          Ver productos
        </Link>
        <Link
          href="/pedido/consultar"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
        >
          Consultar un pedido
        </Link>
      </div>
    </PageShell>
  );
}
