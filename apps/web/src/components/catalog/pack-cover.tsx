import Image from "next/image";
import { resolvePackCoverSources } from "@/lib/pack-images";

type PackCoverProps = {
  pack: {
    slug: string;
    name: string;
    imageUrl?: string | null;
    items?: Array<{
      imageUrl?: string | null;
      categorySlug?: string | null;
      categoryName?: string | null;
      subcategorySlug?: string | null;
    }>;
  };
  className?: string;
  sizes?: string;
};

export function PackCover({
  pack,
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: PackCoverProps) {
  const sources = resolvePackCoverSources(pack);
  const count = sources.length;

  return (
    <div className={`relative overflow-hidden bg-stone-200 ${className}`}>
      {count === 1 ? (
        <Image
          src={sources[0]}
          alt={pack.name}
          fill
          sizes={sizes}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className={`absolute inset-0 grid gap-0.5 ${
            count === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"
          }`}
        >
          {sources.map((src, index) => (
            <div key={`${src}-${index}`} className="relative min-h-0">
        <Image
          src={src}
          alt={index === 0 ? pack.name : `Detalle de ${pack.name}`}
          fill
          sizes={sizes}
          className="object-cover"
        />
            </div>
          ))}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/35 via-transparent to-transparent" />
    </div>
  );
}
