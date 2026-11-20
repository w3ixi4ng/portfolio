import type { ReactNode } from "react";

interface ZoneCardProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

/** Content card that sits beside the avatar (right on desktop, bottom on phones). */
export function ZoneCard({ eyebrow, title, children }: ZoneCardProps) {
  return (
    <section className="card max-h-[42vh] w-full overflow-y-auto p-5 sm:max-h-[72vh] sm:w-[22rem]">
      <p className="text-[11px] font-extrabold tracking-[0.18em] text-ink-soft uppercase">
        {eyebrow}
      </p>
      <h2 className="font-display text-2xl leading-tight font-bold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
