import type { Metadata } from "next";
import { privateAreaMetadata } from "@/lib/site";

export const metadata: Metadata = privateAreaMetadata;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
