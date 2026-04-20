import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Use | RC Data Vault',
}

const H2 = "text-lg font-semibold text-white mt-10 mb-3"
const P = "text-slate-400 leading-7 mt-0 mb-4"
const UL = "list-disc pl-6 text-slate-400 space-y-1 mb-4"

export default function TermsOfUsePage() {
  return (
    <LegalPage title="Terms of Use">
      <p className="text-sm text-slate-500 mb-8">Last updated: April 20, 2026</p>

      <p className={P}>By accessing or using RC Data Vault, you agree to these Terms of Use.</p>

      <h2 className={H2}>Service Description</h2>
      <p className={P}>RC Data Vault provides market-based pricing insights, valuation context, sold listing history, parts information, and related research tools for RC vehicles and parts.</p>
      <p className={P}>All information is provided for general informational purposes only.</p>

      <h2 className={H2}>No Guarantee of Accuracy</h2>
      <p className={P}>We do not guarantee that any information on RC Data Vault is complete, accurate, current, or suitable for your specific purpose.</p>
      <p className={P}>Market values, pricing ranges, trends, sold listing data, and related signals can change over time and may be affected by condition, region, timing, listing quality, and many other factors.</p>

      <h2 className={H2}>No Financial, Investment, or Professional Advice</h2>
      <p className={P}>Nothing on RC Data Vault constitutes:</p>
      <ul className={UL}>
        <li>financial advice</li>
        <li>investment advice</li>
        <li>legal advice</li>
        <li>tax advice</li>
        <li>purchasing or resale advice</li>
      </ul>
      <p className={P}>You are solely responsible for your own buying, selling, bidding, collecting, and valuation decisions.</p>

      <h2 className={H2}>Acceptable Use</h2>
      <p className={P}>You agree not to:</p>
      <ul className={UL}>
        <li>scrape, copy, or extract platform data at scale without permission</li>
        <li>interfere with the operation or security of the platform</li>
        <li>attempt to reverse engineer or misuse the service</li>
        <li>use the platform for unlawful, fraudulent, or abusive purposes</li>
      </ul>

      <h2 className={H2}>Intellectual Property</h2>
      <p className={P}>RC Data Vault owns the platform design, structure, presentation, original copy, branding, and compiled data presentation except where otherwise noted.</p>
      <p className={P}>All manufacturer names, product names, trademarks, and logos remain the property of their respective owners.</p>

      <h2 className={H2}>Third-Party Content and Links</h2>
      <p className={P}>RC Data Vault may display data derived from third-party sources and may link to external retailers, marketplaces, manuals, and other resources.</p>
      <p className={P}>We do not control third-party sites or guarantee the availability, accuracy, or continued validity of third-party content or links.</p>

      <h2 className={H2}>Limitation of Liability</h2>
      <p className={P}>To the maximum extent permitted by law, RC Data Vault and its owners, operators, and affiliates are not liable for any loss, damage, cost, or claim arising from:</p>
      <ul className={UL}>
        <li>your use of the platform</li>
        <li>your reliance on any information shown on the platform</li>
        <li>buying or selling decisions</li>
        <li>broken, outdated, or changed third-party links</li>
        <li>delays, outages, or data inaccuracies</li>
      </ul>
      <p className={P}>Use of the platform is at your own risk.</p>

      <h2 className={H2}>Changes to the Service</h2>
      <p className={P}>We may modify, suspend, or discontinue any part of RC Data Vault at any time without notice.</p>

      <h2 className={H2}>Changes to These Terms</h2>
      <p className={P}>We may update these Terms of Use from time to time. When we do, we will update the &quot;Last updated&quot; date above.</p>
    </LegalPage>
  )
}
