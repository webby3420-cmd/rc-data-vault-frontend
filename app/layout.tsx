import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RC Data Vault",
  description: "Used RC car values, price guides, and sold market data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer
          style={{
            borderTop: "1px solid #1e293b",
            marginTop: "3rem",
            padding: "1.5rem 1rem",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: "0.5rem" }}>
            <a
              href="/rc"
              style={{
                fontSize: "0.875rem",
                color: "#f59e0b",
                textDecoration: "none",
              }}
            >
              Browse RC Vehicle Values
            </a>
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              maxWidth: "48rem",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            RC Data Vault is an independent valuation and price guide platform. All manufacturer names, model names, and trademarks are the property of their respective owners. We are not affiliated with or endorsed by any manufacturer.
          </p>
        </footer>
      </body>
    </html>
  );
}
