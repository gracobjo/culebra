import Link from "next/link";
import { auth } from "@/auth";
import { getVendorByUserId } from "@culebra/auth";
import { redirect } from "next/navigation";
import { VendorApplyForm } from "@/components/vendor/vendor-apply-form";
import { PageShell } from "@/components/layout/page-shell";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Quiero vender",
  description: "Captacion B2B: grupo piloto para los primeros 10 productores.",
  path: "/quiero-vender",
});

export default async function SellPage() {
  const session = await auth();
  const existingVendor = session?.user ? await getVendorByUserId(session.user.id) : null;
  if (existingVendor) redirect("/panel/proveedor");

  return (
    <PageShell width="xl">
      <div className="space-y-12">
        {/* Cabecera / Hero */}
        <header className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
            Primeros 10 productores piloto
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">
            Tus productos de la Sierra de la Culebra, directos de tu obrador al cliente final
          </h1>
          <p className="mt-5 max-w-3xl text-stone-600 sm:text-lg">
            No somos otra charcuteria online ni una plataforma institucional compleja. Somos el
            nodo rural de Villardeciervos: consolidamos tus pedidos, empaquetamos por ti y
            vendemos con una comision clara.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {session?.user ? (
              <a
                href="#formulario-piloto"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-6 py-3 text-sm font-medium text-white"
              >
                Quiero ser uno de los 10 productores piloto
              </a>
            ) : (
              <Link
                href="/login?callbackUrl=/quiero-vender"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-6 py-3 text-sm font-medium text-white"
              >
                Quiero ser uno de los 10 productores piloto
              </Link>
            )}

            <Link
              href="/contacto"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-900"
            >
              Prefiero hablar primero
            </Link>
          </div>
        </header>

        {/* Problema */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">El problema del productor</h2>
            <p className="mt-3 text-stone-600">
              Sabemos que tu prioridad es el obrador, la dehesa, las colmenas o el viñedo. El
              comercio electronico tradicional te obliga a:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-stone-700">
              <li>Perder horas gestionando agencias de transporte y pegando etiquetas</li>
              <li>Asumir paneles informaticos complejos que cambian cada mes</li>
              <li>Regalar tu margen de beneficio con comisiones abusivas o exigencias de stock minimo</li>
            </ul>
          </div>

          {/* Solucion */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Nuestra solucion</h2>
            <p className="mt-3 text-stone-600">
              La alternativa justa: el Nodo Agroalimentario de Villardeciervos. Tu haces lo mejor
              que se te da; nosotros nos encargamos del resto desde nuestro showroom fisico y digital.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-stone-700">
              <li>
                <span className="font-medium">Consolidacion en Villardeciervos:</span> no envias paquetes individuales.
                Empaquetamos todo en una sola caja por lote.
              </li>
              <li>
                <span className="font-medium">Gestion sin barreras (via WhatsApp):</span> nos avisas por WhatsApp y un
                humano introduce los datos en el sistema.
              </li>
              <li>
                <span className="font-medium">Trato justo y transparente:</span> sin cuotas anuales obligatorias.
                Cobramos una comision fija del 17% con minimo de 4€ por operacion.
              </li>
              <li>
                <span className="font-medium">Logistica clara:</span> tarifa plana a cargo del cliente.
              </li>
            </ul>
          </div>
        </section>

        {/* Defensa del producto */}
        <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Defensa del producto (ventana corta)</h2>
          <p className="mt-3 text-stone-600">
            Ponemos en valor la pureza de tu producto. No escondemos que los dulces tradicionales,
            loncheados de caza o quesos semicurados tienen un consumo preferente menor a 90 dias.
            Lo convertimos en orgullo bajo nuestra categoria “Consumo de temporada / ventana corta”.
          </p>
        </section>

        {/* Bloque autoridad */}
        <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">De la Sierra para la Sierra</h2>
          <p className="mt-3 text-stone-600">
            Operamos desde Villardeciervos, actuando como un dinamizador real del territorio. No compramos stock
            para especular con los precios ni masificamos la plataforma.
          </p>
          <p className="mt-3 text-stone-600">
            Solo admitiremos a <span className="font-semibold text-emerald-900">10 productores iniciales</span> en esta
            fase de lanzamiento para asegurar un servicio logistico impecable, sesiones de fotos profesionales y
            fichas de storytelling personalizadas para cada marca.
          </p>
        </section>

        {/* Formulario de captacion */}
        <section id="formulario-piloto" className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10">
          <h2 className="text-2xl font-semibold">Formulario de captacion / cierre</h2>
          <p className="mt-3 text-stone-600">
            Plazas limitadas para el grupo piloto (Lanzamiento 2026). Dejanos tus datos y nos acercamos a tu obrador
            para explicarte el proyecto en persona.
          </p>

          <div className="mt-8">
            {session?.user ? (
              <>
                <p className="text-sm text-stone-600">
                  El formulario recoge los datos para tu solicitud piloto. En concreto: <b>Marca</b>, <b>Municipio</b>, <b>Tipo de producto</b> y <b>Telefono</b>.
                </p>
                <div className="mt-5">
                  <VendorApplyForm />
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-stone-200 bg-[color-mix(in_srgb,var(--cream)_65%,white)] p-6">
                <p className="text-sm text-stone-700">
                  Necesitas una cuenta para reservar tu plaza. Cuando inicies sesion, completaras el formulario de solicitud.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/login?callbackUrl=/quiero-vender"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-6 py-3 text-sm font-medium text-white"
                  >
                    Iniciar sesion
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-900"
                  >
                    Crear cuenta
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
