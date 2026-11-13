import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import { brand, meta } from "@/content/site";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

// Absolute base for Open Graph URLs: explicit env var, else the Vercel production domain, else local.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: brand.name,
    title: meta.title,
    description: meta.description,
    locale: "en_GB",
    images: [{ url: meta.ogImage, width: 1920, height: 1080, alt: `${brand.name} perfume bottle on a wine-coloured pedestal` }],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
    images: [meta.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: meta.themeColor,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
