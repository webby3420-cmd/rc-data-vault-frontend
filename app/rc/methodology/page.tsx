// app/rc/methodology/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Methodology — RC Data Vault",
  description:
    "How RC Data Vault estimates RC market values from sold comps, how confidence is scored, and the current eBay sold-comp ingestion limitation.",
  alternates: { canonical: "/rc/methodology" },
};

const PUBLISHED = "May 2026";
const UPDATED = "May 12, 2026";
const SUPPORT_EMAIL = "support@rcdatavault.com";

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <article>
        <header>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            How RC Data Vault estimates RC market values
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            By{" "}
            <span className="font-medium text-slate-200">Jason Webster</span> —
            JW RC LLC / RC Data Vault
          </p>
          <p className="mt-1 text-sm text-slate-400">
            <span>Published: {PUBLISHED}</span>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            <span>Last updated: {UPDATED}</span>
          </p>
          <p className="mt-2 text-sm italic text-slate-400">
            Maintained by Jason Webster for RC Data Vault.
          </p>
        </header>

        <section className="mt-8 space-y-4 text-slate-200">
          <p>
            Values shown on RC Data Vault are{" "}
            <span className="font-medium">estimates</span> derived from public
            sales data. They are directional market signals — not appraisals,
            not offers, and not a promise of what any particular vehicle will
            sell for. This page explains where the numbers come from, what we
            filter out, how confidence is scored, and the current limitations
            you should know about.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white">
            How we estimate value
          </h2>
          <div className="mt-4 space-y-4 text-slate-200">
            <p>
              <span className="font-medium">Sold comps are the primary signal.</span>{" "}
              We build estimates from completed sales on eBay and other
              marketplaces — what buyers actually paid, not what sellers were
              asking. Active listings are used for market context and to surface
              potential deals; they do not silently replace sold comps as a
              fair-market estimate.
            </p>
            <p>
              <span className="font-medium">Parts and accessories are excluded.</span>{" "}
              When a listing is detected as a body shell, electronics module,
              tires, parts lot, or accessory rather than a complete vehicle, it
              is excluded from vehicle valuation.
            </p>
            <p>
              <span className="font-medium">Contaminated listings are filtered or downgraded.</span>{" "}
              Wrong trim or sub-model, scale mismatches, multi-vehicle bundles,
              rollers and sliders, parts lots described as &ldquo;truck,&rdquo;
              and ambiguous titles are filtered before they reach a valuation,
              or have their weight reduced when ambiguity remains.
            </p>
            <p>
              <span className="font-medium">Confidence reflects evidence, not certainty.</span>{" "}
              Three things shape the confidence tier shown next to a value:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Sample size — how many clean sold comps support the estimate
              </li>
              <li>
                Freshness — how recent the latest qualifying sold comp is
              </li>
              <li>
                Spread — how tightly recent sale prices cluster around the
                median
              </li>
            </ul>
            <p>
              A model with many recent, tightly-clustered comps earns a higher
              confidence tier. Wider spreads, older comps, or thin samples bring
              confidence down. As sold comps age, their weight decreases — an
              older market is a weaker market signal, and the tier label reflects
              that.
            </p>
            <p>
              <span className="font-medium">No sold-comp data means no fabricated price.</span>{" "}
              If we don&apos;t have qualifying sold comps for a variant, RC Data
              Vault does not invent a number. The interface will indicate that
              evidence is insufficient rather than display a falsely precise
              estimate.
            </p>
            <p>
              <span className="font-medium">Prices and fees.</span> Prices shown
              are the listed sale price as posted on the marketplace. Shipping
              is tracked separately and is not added to the estimate.
              Marketplace seller fees are paid by the seller out of their
              proceeds and don&apos;t change what the buyer paid, so they
              don&apos;t affect our estimates.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white">
            Current data limitation
          </h2>
          <div className="mt-4 space-y-4 text-slate-200">
            <p>
              We want to be upfront: sold-comp ingestion via the eBay Finding
              API is currently <span className="font-medium">externally paused</span>{" "}
              due to a persistent eBay RateLimiter error (error code 10001).
              This is a vendor-side limitation we are working around, not a
              choice to withhold data.
            </p>
            <p>
              What that means in practice:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Existing valuations rely on the latest qualifying sold comps we
                had already collected before the pause.
              </li>
              <li>
                Freshness indicators and confidence tiers are used to prevent
                stale data from looking more certain than it is. If recent comps
                are missing or aging, the displayed tier reflects that.
              </li>
              <li>
                Active listings may still power deal-surface and supply context
                on market pages, but they do not silently stand in for sold
                comps as a fair-market estimate.
              </li>
              <li>
                When ingestion resumes, refreshed sold comps will flow back into
                the estimates and confidence tiers automatically.
              </li>
            </ul>
            <p>
              Our position: it is better to show an older estimate with an
              honest freshness label than to fabricate a current one. If
              evidence is insufficient, we say so.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white">
            Challenge a value or report bad comps
          </h2>
          <div className="mt-4 space-y-4 text-slate-200">
            <p>
              If a value looks wrong, if you spot a listing that shouldn&apos;t
              be in a comp set (wrong trim, parts lot, scale mismatch, bundle),
              or if you have context we&apos;re missing on a specific model,
              tell us. Reader feedback is one of the most reliable ways we
              catch contamination.
            </p>
            <p>
              Email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  "Methodology feedback / challenge a value",
                )}`}
                className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
              >
                {SUPPORT_EMAIL}
              </a>
              . Include the variant page URL and, where possible, a link to the
              comp you&apos;re flagging.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white">Related</h2>
          <ul className="mt-4 list-disc space-y-1 pl-6 text-slate-200">
            <li>
              <Link
                href="/rc"
                className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
              >
                RC manufacturers and models
              </Link>{" "}
              — browse the catalog whose values this methodology describes.
            </li>
            <li>
              <Link
                href="/market"
                className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
              >
                Live market
              </Link>{" "}
              — active listings used as supply context, not as silent FMV.
            </li>
            <li>
              <Link
                href="/deals"
                className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
              >
                Deals
              </Link>{" "}
              — listings flagged as priced below recent sold-comp evidence.
            </li>
            <li>
              <Link
                href="/disclaimer"
                className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
              >
                Disclaimer
              </Link>{" "}
              and{" "}
              <Link
                href="/terms-of-use"
                className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
              >
                Terms of use
              </Link>
              .
            </li>
          </ul>
        </section>

        <footer className="mt-10 border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-400">
            Values on RC Data Vault are estimates derived from public sales
            data. They are not appraisals, not offers, and not a promise of
            sale price. Read them as directional market signals with a
            confidence tier, and use the feedback channel above if something
            looks off.
          </p>
        </footer>
      </article>
    </main>
  );
}
