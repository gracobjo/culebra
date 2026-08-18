import { orderStatusLabels, vendorOrderStatusLabels } from "@/lib/format";

export function OrderStatusBadge({
  status,
  kind = "order",
}: {
  status: string;
  kind?: "order" | "vendor";
}) {
  const labels = kind === "vendor" ? vendorOrderStatusLabels : orderStatusLabels;
  return (
    <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-800">
      {labels[status] ?? status}
    </span>
  );
}
