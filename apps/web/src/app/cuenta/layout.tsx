import type { Metadata } from "next";
import { privateAreaMetadata } from "@/lib/site";

export const metadata: Metadata = privateAreaMetadata;

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
