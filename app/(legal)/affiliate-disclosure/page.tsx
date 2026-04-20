import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | RC Data Vault',
}

const H2 = "text-lg font-semibold text-white mt-10 mb-3"
const P = "text-slate-400 leading-7 mt-0 mb-4"
const UL = "list-disc pl-6 text-slate-400 space-y-1 mb-4"

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage title="Affiliate Disclosure">
      <p className="text-sm text-slate-500 mb-8">Last updated: April 20, 2026</p>

      <p className={P}>RC Data Vault participates in affiliate programs, including programs such as Amazon Associates, eBay Partner Network, and other retailer or marketplace affiliate programs.</p>
      <p className={P}>This means we may earn a commission if you click certain links and make a purchase.</p>

      <h2 className={H2}>How This Works</h2>
      <p className={P}>When a link is identified as an affiliate link, RC Data Vault may receive compensation from the retailer or affiliate network if a qualifying purchase is made.</p>

      <h2 className={H2}>What Does Not Change</h2>
      <p className={P}>Affiliate relationships do not control:</p>
      <ul className={UL}>
        <li>pricing calculations</li>
        <li>valuation logic</li>
        <li>sold listing analysis</li>
        <li>market ranges</li>
        <li>confidence signals</li>
      </ul>
      <p className={P}>Our goal is to surface relevant and useful links, but affiliate availability may influence which purchase links are displayed when multiple options exist.</p>

      <h2 className={H2}>No Extra Cost to You</h2>
      <p className={P}>Using an affiliate link generally does not increase the price you pay.</p>

      <h2 className={H2}>External Retailers</h2>
      <p className={P}>All purchases are completed on third-party websites, which operate under their own pricing, shipping, return, privacy, and support policies.</p>
    </LegalPage>
  )
}
