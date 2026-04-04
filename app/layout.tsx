import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'RC Data Vault | Used RC Car Values & Price Guide',
    template: '%s | RC Data Vault',
  },
  description: 'Used RC car values, price guides, and sold market data for Traxxas, ARRMA, Losi, Axial, and more.',
  metadataBase: new URL('https://rcdatavault.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <a href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-white">
                RC<span className="text-amber-400">DataVault</span>
              </span>
            </a>
            <nav className="flex items-center gap-6 text-sm">
              <a href="/rc" className="text-slate-400 transition hover:text-white">Values</a>
              <a href="/market" className="text-slate-400 transition hover:text-white">Market</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-slate-800 mt-12 py-8 px-4 text-center">
          <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
            RC Data Vault is an independent valuation and price guide platform. All manufacturer names, model names, and trademarks are the property of their respective owners. We are not affiliated with or endorsed by any manufacturer.
          </p>
        </footer>
      </body>
    </html>
  )
}
