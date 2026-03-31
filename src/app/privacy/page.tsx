import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          Privacy Policy
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
              1. Overview
            </h2>
            <p className="text-sm leading-relaxed">
              VerifyDeal (&quot;we&quot;, &quot;our&quot;, &quot;the Service&quot;) is a marketplace photo
              verification tool. This policy explains what data we collect, how we use it,
              and your rights regarding that data.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              2. Data We Collect
            </h2>

            <h3
              className="text-sm font-semibold mt-4 mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Account Information
            </h3>
            <p className="text-sm leading-relaxed mb-3">
              When you sign up, we collect your email address and authentication credentials.
              If you sign in with Google, we receive your email and profile name from Google.
              We do not store your Google password.
            </p>

            <h3
              className="text-sm font-semibold mt-4 mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Uploaded Images
            </h3>
            <p className="text-sm leading-relaxed mb-3">
              When you upload an image for verification, we process it to generate
              cryptographic hashes (SHA-256) and perceptual hashes (dHash). These hashes
              are stored permanently to enable duplicate detection for all users. The
              original image data is not permanently stored on our servers -- it is
              processed in memory and discarded after analysis.
            </p>

            <h3
              className="text-sm font-semibold mt-4 mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Scan History
            </h3>
            <p className="text-sm leading-relaxed mb-3">
              If you are signed in, we store your scan results (trust score, verdict, and
              image hash) linked to your account to provide your dashboard and usage tracking.
            </p>

            <h3
              className="text-sm font-semibold mt-4 mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Community Reports
            </h3>
            <p className="text-sm leading-relaxed mb-3">
              Scam reports you submit (category, platform, description) are stored and
              publicly visible to other users. Reports are not linked to your user account
              in the public feed.
            </p>

            <h3
              className="text-sm font-semibold mt-4 mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Ticket/QR Codes
            </h3>
            <p className="text-sm leading-relaxed">
              When you verify a ticket, any detected QR or barcode data is stored to enable
              duplicate ticket detection. This helps protect other buyers from counterfeit
              tickets.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              3. How We Use Your Data
            </h2>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>To provide image verification and trust scoring</li>
              <li>To detect duplicate images and ticket codes across the platform</li>
              <li>To display your scan history and usage on your dashboard</li>
              <li>To manage your subscription and billing through Stripe</li>
              <li>To improve the accuracy of our verification algorithms</li>
              <li>To prevent abuse and enforce our Terms of Service</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              4. Third-Party Services
            </h2>
            <p className="text-sm leading-relaxed mb-3">We use the following third-party services:</p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>
                <strong>Supabase</strong> -- database hosting and authentication. Your account
                data and image hashes are stored in Supabase.{" "}
                <a href="https://supabase.com/privacy" style={{ color: "var(--accent)" }} target="_blank" rel="noopener noreferrer">
                  Supabase Privacy Policy
                </a>
              </li>
              <li>
                <strong>Stripe</strong> -- payment processing for Pro subscriptions. Stripe
                handles your payment information directly; we do not store credit card numbers.{" "}
                <a href="https://stripe.com/privacy" style={{ color: "var(--accent)" }} target="_blank" rel="noopener noreferrer">
                  Stripe Privacy Policy
                </a>
              </li>
              <li>
                <strong>TinEye</strong> -- reverse image search. Uploaded images are sent to
                TinEye&apos;s API for web-wide duplicate detection when configured.{" "}
                <a href="https://tineye.com/privacy" style={{ color: "var(--accent)" }} target="_blank" rel="noopener noreferrer">
                  TinEye Privacy Policy
                </a>
              </li>
              <li>
                <strong>SerpAPI</strong> -- Google Lens integration. Images may be sent to
                SerpAPI for visual matching when configured.{" "}
                <a href="https://serpapi.com/legal" style={{ color: "var(--accent)" }} target="_blank" rel="noopener noreferrer">
                  SerpAPI Terms
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              5. Data Retention
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              Image hashes and ticket codes are retained indefinitely to support duplicate
              detection across the platform. Scan history is retained as long as your account
              is active. Community reports are retained indefinitely.
            </p>
            <p className="text-sm leading-relaxed">
              If you delete your account, your scan history and personal data will be removed.
              Image hashes and community reports you submitted may be retained in anonymized
              form to protect other users.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              6. Your Rights
            </h2>
            <p className="text-sm leading-relaxed mb-3">You have the right to:</p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and personal data</li>
              <li>Export your scan history</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:support@verifydeal.com"
                style={{ color: "var(--accent)" }}
              >
                support@verifydeal.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              7. Cookies
            </h2>
            <p className="text-sm leading-relaxed">
              We use essential cookies for authentication session management (Supabase auth
              tokens). We use localStorage for your theme preference. We do not use
              tracking cookies or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              8. Security
            </h2>
            <p className="text-sm leading-relaxed">
              We use encryption in transit (HTTPS/TLS), row-level security on our database,
              and rate limiting on all API endpoints. While we take reasonable measures to
              protect your data, no system is 100% secure. We encourage you to use strong,
              unique passwords.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              9. Children
            </h2>
            <p className="text-sm leading-relaxed">
              The Service is not intended for children under 13. We do not knowingly collect
              data from children. If you believe a child has provided us with personal data,
              contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              10. Changes
            </h2>
            <p className="text-sm leading-relaxed">
              We may update this policy from time to time. Material changes will be
              communicated through the Service. Continued use after changes constitutes
              acceptance of the updated policy.
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
              For privacy-related questions or requests, contact us at{" "}
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
