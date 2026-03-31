import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
          }}
        >
          Terms of Service
        </h1>
        <p
          className="text-sm mb-12"
          style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
        >
          Last updated: March 31, 2026
        </p>

        <div className="space-y-10" style={{ color: "var(--text-secondary)" }}>
          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              1. Acceptance of Terms
            </h2>
            <p className="text-sm leading-relaxed">
              By accessing or using VerifyDeal (&quot;the Service&quot;), you agree to be bound by
              these Terms of Service. If you do not agree, do not use the Service. We may
              update these terms at any time; continued use after changes constitutes
              acceptance.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              2. Description of Service
            </h2>
            <p className="text-sm leading-relaxed">
              VerifyDeal provides image verification tools for marketplace listings. The Service
              analyzes uploaded images using reverse image search, perceptual hashing, forensic
              analysis, and community-reported data to generate a trust score. The Service is
              provided as an informational tool and does not guarantee the authenticity of any
              listing or seller.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              3. User Accounts
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              You may need to create an account to access certain features. You are responsible
              for maintaining the confidentiality of your account credentials. You agree to
              provide accurate information and to notify us immediately of any unauthorized
              access to your account.
            </p>
            <p className="text-sm leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms
              or engage in abusive behavior.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              4. Acceptable Use
            </h2>
            <p className="text-sm leading-relaxed mb-3">You agree not to:</p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Upload illegal, obscene, or malicious content</li>
              <li>Attempt to reverse-engineer, scrape, or overload the Service</li>
              <li>Use the Service to harass, defame, or harm others</li>
              <li>Submit false scam reports or manipulate community data</li>
              <li>Use automated tools to access the Service beyond normal usage</li>
              <li>Resell or redistribute results from the Service without permission</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              5. Image Uploads
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              When you upload an image, we process it to generate hashes and verification
              results. By uploading, you represent that you have the right to use the image
              for verification purposes. We store image fingerprints (hashes) to enable
              duplicate detection across the platform. We do not claim ownership of your
              uploaded images.
            </p>
            <p className="text-sm leading-relaxed">
              See our{" "}
              <Link href="/privacy" style={{ color: "var(--accent)" }}>
                Privacy Policy
              </Link>{" "}
              for details on how image data is stored and processed.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              6. Community Reports
            </h2>
            <p className="text-sm leading-relaxed">
              Users may submit scam reports and upvote community submissions. You agree that
              reports you submit are truthful to the best of your knowledge. We reserve the
              right to remove reports that are false, misleading, or violate these terms.
              VerifyDeal is not liable for the accuracy of user-submitted reports.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              7. Paid Subscriptions
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              VerifyDeal offers a free tier and paid Pro subscription. Paid subscriptions
              are billed monthly through Stripe. You may cancel at any time; cancellation
              takes effect at the end of the current billing period. Refunds are handled
              on a case-by-case basis.
            </p>
            <p className="text-sm leading-relaxed">
              We reserve the right to change pricing with 30 days notice to existing
              subscribers.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              8. Disclaimers
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              The Service is provided &quot;as is&quot; without warranty of any kind. VerifyDeal does
              not guarantee that verification results are accurate, complete, or reliable.
              Trust scores are algorithmic estimates and should not be the sole basis for
              purchasing decisions.
            </p>
            <p className="text-sm leading-relaxed">
              We are not responsible for losses resulting from marketplace transactions,
              whether or not you used the Service before purchasing.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              9. Limitation of Liability
            </h2>
            <p className="text-sm leading-relaxed">
              To the maximum extent permitted by law, VerifyDeal and its operators shall not
              be liable for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of the Service. Our total liability shall not
              exceed the amount you paid for the Service in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              10. Termination
            </h2>
            <p className="text-sm leading-relaxed">
              We may terminate or suspend your access to the Service at our discretion,
              with or without notice, for conduct that we believe violates these terms
              or is harmful to other users or the Service.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              11. Contact
            </h2>
            <p className="text-sm leading-relaxed">
              For questions about these terms, contact us at{" "}
              <a
                href="mailto:support@verifydeal.com"
                style={{ color: "var(--accent)" }}
              >
                support@verifydeal.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
