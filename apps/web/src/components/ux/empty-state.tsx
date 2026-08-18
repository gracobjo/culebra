import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center sm:p-10">
      <h2 className="text-lg font-medium text-stone-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
