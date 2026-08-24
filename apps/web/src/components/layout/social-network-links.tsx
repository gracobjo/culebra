import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteSocialLinksRecord } from "@culebra/auth";

export type SocialLinksPublic = Pick<
  SiteSocialLinksRecord,
  "facebookUrl" | "instagramUrl" | "whatsappUrl"
>;

type NetworkId = "facebook" | "instagram" | "whatsapp";

const NETWORKS: Array<{
  id: NetworkId;
  label: string;
  hrefKey: keyof SocialLinksPublic;
}> = [
  { id: "facebook", label: "Facebook", hrefKey: "facebookUrl" },
  { id: "instagram", label: "Instagram", hrefKey: "instagramUrl" },
  { id: "whatsapp", label: "WhatsApp", hrefKey: "whatsappUrl" },
];

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34v7.03C18.34 21.24 22 17.08 22 12.06z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" fill="currentColor" aria-hidden="true">
      <path d="M7.2 3h9.6A4.2 4.2 0 0 1 21 7.2v9.6A4.2 4.2 0 0 1 16.8 21H7.2A4.2 4.2 0 0 1 3 16.8V7.2A4.2 4.2 0 0 1 7.2 3zm0 1.8A2.4 2.4 0 0 0 4.8 7.2v9.6a2.4 2.4 0 0 0 2.4 2.4h9.6a2.4 2.4 0 0 0 2.4-2.4V7.2a2.4 2.4 0 0 0-2.4-2.4H7.2zM12 8.1A3.9 3.9 0 1 1 12 15.9 3.9 3.9 0 0 1 12 8.1zm0 1.8a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2zM17.4 6.45a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.33 4.94L2 22l5.38-1.41a10.1 10.1 0 0 0 4.66 1.12h.01c5.46 0 9.89-4.4 9.89-9.83 0-2.63-1.03-5.1-2.9-6.96A9.9 9.9 0 0 0 12.04 2zm0 1.8c2.17 0 4.21.84 5.75 2.37a8.05 8.05 0 0 1 2.36 5.71c0 4.46-3.64 8.08-8.11 8.08h-.01a8.3 8.3 0 0 1-3.98-.99l-.28-.16-3.19.84.85-3.11-.18-.3a8.05 8.05 0 0 1-1.23-4.36c0-4.46 3.65-8.08 8.12-8.08zm-2.7 4.33c-.17 0-.44.06-.67.33-.23.27-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.75 2.8 4.32 3.82 2.14.85 2.57.68 3.04.64.47-.04 1.51-.61 1.72-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.17-.48-.3-.25-.13-1.51-.74-1.74-.83-.23-.08-.4-.13-.57.13-.17.26-.65.82-.8.99-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.73-.15-.26-.02-.4.11-.53.12-.12.25-.3.38-.45.13-.15.17-.26.25-.43.09-.17.04-.32-.02-.45-.06-.13-.56-1.36-.77-1.86-.2-.48-.41-.42-.57-.42z" />
    </svg>
  );
}

const ICONS: Record<NetworkId, () => ReactNode> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  whatsapp: WhatsAppIcon,
};

function iconButtonClass(tone: "onLight" | "onDark", size: "sm" | "md") {
  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  if (tone === "onDark") {
    return `${box} inline-flex items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 transition hover:bg-white hover:text-emerald-950`;
  }
  return `${box} inline-flex items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-sm transition hover:border-emerald-700 hover:text-emerald-800`;
}

export function SocialNetworkLinks({
  socials,
  variant = "pills",
  tone = "onLight",
  size = "md",
  className = "",
}: {
  socials: SocialLinksPublic | null;
  variant?: "pills" | "icons";
  tone?: "onLight" | "onDark";
  size?: "sm" | "md";
  className?: string;
}) {
  const items = NETWORKS.map((network) => ({
    ...network,
    href: socials?.[network.hrefKey] ?? null,
  })).filter((item): item is typeof item & { href: string } => Boolean(item.href));

  if (items.length === 0) return null;

  if (variant === "icons") {
    return (
      <nav className={`flex items-center gap-2 ${className}`} aria-label="Redes sociales">
        {items.map((item) => {
          const Icon = ICONS[item.id];
          return (
            <Link
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              title={item.label}
              className={iconButtonClass(tone, size)}
            >
              <Icon />
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className={`flex flex-wrap gap-3 ${className}`} aria-label="Redes sociales">
      {items.map((item) => {
        const Icon = ICONS[item.id];
        return (
          <Link
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-medium text-stone-900 hover:border-emerald-600"
          >
            <span className="text-emerald-800">
              <Icon />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
