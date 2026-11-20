import type { Metadata } from "next";
import Link from "next/link";
import { PlainContent } from "@/components/ui/PlainContent";
import { profile } from "@/content";

export const metadata: Metadata = {
  title: `${profile.name} · Plain version`,
  description: profile.pitch,
  alternates: { canonical: "/plain" },
};

/** Accessible, no-3D version of the whole portfolio (CLAUDE.md §8). */
export default function PlainPage() {
  return (
    <main className="min-h-screen bg-paper px-4 py-10 sm:py-16">
      <PlainContent
        backLink={
          <Link href="/" className="text-sm font-bold text-teal-ink underline">
            ← Back to the jump
          </Link>
        }
      />
    </main>
  );
}
