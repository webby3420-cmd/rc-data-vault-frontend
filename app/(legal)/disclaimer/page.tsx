import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Disclaimer | RC Data Vault',
}

const H2 = "text-lg font-semibold text-white mt-10 mb-3"
const P = "text-slate-400 leading-7 mt-0 mb-4"
const UL = "list-disc pl-6 text-slate-400 space-y-1 mb-4"

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <p className="text-sm text-slate-500 mb-8">Last updated: April 20, 2026</p>

      <p className={P}>RC Data Vault provides market-based pricing insights, trends, sold listing references, parts information, and related research tools for informational purposes only.</p>

      <h2 className={H2}>Informational Use Only</h2>
      <p className={P}>All values, price ranges, buy zones, overpay zones, confidence signals, and market observations shown on RC Data Vault are informational estimates based on historical and marketplace-derived data.</p>
      <p className={P}>They are not guarantees.</p>

      <h2 className={H2}>No Financial Advice</h2>
      <p className={P}>RC Data Vault does not provide financial advice, investment advice, or professional appraisal services.</p>
      <p className={P}>Nothing on the platform should be treated as a recommendation to buy, sell, hold, bid on, or avoid any RC vehicle, part, or listing.</p>

      <h2 className={H2}>Market Variability</h2>
      <p className={P}>Actual market value can vary significantly based on factors including:</p>
      <ul className={UL}>
        <li>condition</li>
        <li>completeness</li>
        <li>upgrades or modifications</li>
        <li>region</li>
        <li>shipping availability</li>
        <li>timing</li>
        <li>listing quality</li>
        <li>seller behavior</li>
        <li>marketplace volatility</li>
      </ul>

      <h2 className={H2}>No Guarantee of Current or Future Value</h2>
      <p className={P}>Past sold listings and prior marketplace activity do not guarantee current pricing or future resale value.</p>

      <h2 className={H2}>Buyer and Seller Responsibility</h2>
      <p className={P}>You are solely responsible for independently verifying listing details, fitment, condition, authenticity, and market context before making any purchasing or selling decision.</p>
    </LegalPage>
  )
}
