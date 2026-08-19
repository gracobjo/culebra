type DownloadOrderDocumentButtonProps = {
  href: string;
  label?: string;
  className?: string;
};

export function DownloadOrderDocumentButton({
  href,
  label = "Descargar PDF",
  className = "inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-800 px-5 py-3 text-sm font-medium text-emerald-800 hover:bg-emerald-50",
}: DownloadOrderDocumentButtonProps) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
