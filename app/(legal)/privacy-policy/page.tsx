import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy | RC Data Vault',
}

const H2 = "text-lg font-semibold text-white mt-10 mb-3"
const P = "text-slate-400 leading-7 mt-0 mb-4"
const UL = "list-disc pl-6 text-slate-400 space-y-1 mb-4"
const A = "text-amber-400"

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p className="text-sm text-slate-500 mb-8">Last updated: April 20, 2026</p>

      <p className={P}>RC Data Vault (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates rcdatavault.com.</p>
      <p className={P}>This Privacy Policy explains what information we collect, how we use it, and the choices available to you when you use the platform.</p>

      <h2 className={H2}>Information We Collect</h2>
      <p className={P}>We collect limited information needed to operate and improve RC Data Vault, including:</p>
      <ul className={UL}>
        <li>Email address, if you create price alerts or otherwise contact us</li>
        <li>Usage data, such as pages viewed and interactions with the site</li>
        <li>Technical data, such as IP address, device type, browser type, and approximate location derived from standard web requests</li>
      </ul>
      <p className={P}>We do not intentionally collect sensitive personal information, payment card information, or government-issued identification data.</p>

      <h2 className={H2}>How We Use Information</h2>
      <p className={P}>We use information we collect to:</p>
      <ul className={UL}>
        <li>Deliver price alerts and other features you request</li>
        <li>Operate, maintain, and improve the platform</li>
        <li>Monitor platform performance, reliability, and usage patterns</li>
        <li>Detect abuse, fraud, or misuse of the service</li>
        <li>Support affiliate, analytics, and product performance reporting</li>
      </ul>
      <p className={P}>We do not sell your personal information.</p>

      <h2 className={H2}>Analytics, Cookies, and Similar Technologies</h2>
      <p className={P}>RC Data Vault may use analytics tools, cookies, and similar technologies to understand how people use the site and to improve performance and usability.</p>
      <p className={P}>These tools may collect standard browser and device information, page activity, and referral information.</p>

      <h2 className={H2}>Third-Party Services</h2>
      <p className={P}>We rely on third-party services to operate the platform, including services for:</p>
      <ul className={UL}>
        <li>Hosting and infrastructure</li>
        <li>Database and backend operations</li>
        <li>Analytics</li>
        <li>Email delivery</li>
        <li>Affiliate tracking and retailer linking</li>
      </ul>
      <p className={P}>These providers may process limited information as necessary to provide their services to us.</p>

      <h2 className={H2}>Price Alerts and Emails</h2>
      <p className={P}>If you provide your email address to create a price alert:</p>
      <ul className={UL}>
        <li>We will use it to send the alert emails you requested</li>
        <li>You may unsubscribe at any time using the unsubscribe link in the email</li>
        <li>We may store alert preferences you submit, such as target price or model tracking settings</li>
      </ul>

      <h2 className={H2}>Affiliate Links and External Sites</h2>
      <p className={P}>Some links on RC Data Vault point to third-party retailers or marketplaces. If you click those links, you may be taken to external websites that operate under their own privacy policies and terms.</p>
      <p className={P}>We are not responsible for the privacy practices of third-party sites.</p>

      <h2 className={H2}>Data Retention</h2>
      <p className={P}>We retain information only as long as reasonably necessary to operate the platform, fulfill the purpose for which the data was collected, comply with legal obligations, and resolve disputes.</p>

      <h2 className={H2}>Your Choices</h2>
      <p className={P}>You may contact us to request deletion of personal information you have directly provided to us, such as an email address used for alerts, subject to any legal or operational obligations we may have to retain limited records.</p>
      <p className={P}>Contact: <a className={A} href="mailto:support@rcdatavault.com">support@rcdatavault.com</a></p>

      <h2 className={H2}>Children&apos;s Privacy</h2>
      <p className={P}>RC Data Vault is not directed to children under 13, and we do not knowingly collect personal information from children under 13.</p>

      <h2 className={H2}>Changes to This Policy</h2>
      <p className={P}>We may update this Privacy Policy from time to time. When we do, we will update the &quot;Last updated&quot; date above.</p>
    </LegalPage>
  )
}
