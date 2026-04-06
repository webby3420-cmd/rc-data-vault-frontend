import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import BfcacheReload from '@/components/BfcacheReload'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'RC Data Vault | Used RC Car Values & Price Guide',
    template: '%s | RC Data Vault',
  },
  description: 'Used RC car values, price guides, and sold market data for Traxxas, ARRMA, Losi, Axial, and more.',
  metadataBase: new URL('https://rcdatavault.com'),
}

const MANUFACTURERS = [
  { name: 'Traxxas', slug: 'traxxas' },
  { name: 'ARRMA', slug: 'arrma' },
  { name: 'Losi', slug: 'losi' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BfcacheReload />
        <header className="border-b border-slate-800 bg-slate-950 relative z-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <a href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="RC Data Vault" width={180} height={75} className="h-12 w-auto" />
              <span className="text-lg font-semibold tracking-tight text-white">RC<span className="text-amber-400">DataVault</span></span>
            </a>
            <nav className="flex items-center gap-6 text-sm">
              <div className="relative group">
                <a href="/rc" className="flex items-center gap-1 text-slate-400 transition hover:text-white py-2">
                  Values <span className="text-xs">▾</span>
                </a>
                <div className="absolute top-full left-0 hidden group-hover:block w-48 rounded-xl border border-slate-700 bg-slate-900 shadow-xl py-1">
                  <a href="/rc" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800">All Vehicles</a>
                  <div className="border-t border-slate-800 my-1" />
                  {MANUFACTURERS.map(m => (
                    <a key={m.slug} href={`/rc/${m.slug}`} className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800">{m.name}</a>
                  ))}
                </div>
              </div>
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
