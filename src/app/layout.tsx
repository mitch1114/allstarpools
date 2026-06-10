import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All Star Pools - NCAAF & NFL Spread Pool",
  description: "All Star Pools - Your home for NCAAF and NFL spread pool action",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
