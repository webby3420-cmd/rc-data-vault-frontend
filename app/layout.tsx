import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RC Bluebook",
  description: "Used RC car values, price guides, and sold market data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
