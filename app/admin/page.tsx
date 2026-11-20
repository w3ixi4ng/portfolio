import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminEditor } from "@/components/admin/AdminEditor";

export const metadata: Metadata = {
  title: "Content editor",
  robots: { index: false, follow: false },
};

/** Dev-only content editor (CLAUDE.md §7). 404 in production. */
export default function AdminPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <AdminEditor />;
}
