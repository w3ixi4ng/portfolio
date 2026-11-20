import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { isTodo, profile, settings } from "@/content";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...(isTodo(settings.siteUrl) ? {} : { metadataBase: new URL(settings.siteUrl) }),
  // The tab says just the name.
  title: profile.name,
  description: profile.pitch,
  authors: [{ name: profile.name }],
  openGraph: {
    type: "website",
    title: `${profile.name} · ${profile.title}`,
    description: profile.pitch,
    siteName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} · ${profile.title}`,
    description: profile.pitch,
  },
};

export const viewport: Viewport = {
  themeColor: "#7EC8E3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
