import Link from "next/link";
import {
  Globe,
  Database,
  ArrowRight,
  Clock,
  Flag,
} from "lucide-react";

const steps = [
  {
    title: "Upload the Photo",
    description:
      "Drop, paste, or upload the product photo you received from a seller.",
  },
  {
    title: "We Scan the Web",
    description:
      "Our engine checks TinEye, Google Lens, stock photo databases, and our community scam database.",
  },
  {
    title: "Get Your Verdict",
    description:
      "Receive a trust score from 0 to 100 with detailed analysis of where the image was found.",
  },
];

const features = [
  {
    icon: Globe,
    title: "Reverse Image Search",
    description: "Cross-reference across 50B+ indexed images using TinEye and Google Lens.",
  },
  {
    icon: Database,
    title: "Community Scam Database",
    description: "User-reported scam images build a growing database that protects everyone.",
  },
  {
    icon: Clock,
    title: "Instant Results",
    description: "Get verification results in seconds with our parallel search engine.",
  },
  {
    icon: Flag,
    title: "Report and Protect",
    description: "Flag scam images to warn other buyers and strengthen the community shield.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(0,229,204,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 fade-in-up"
              style={{
                background: "var(--accent-glow)",
                border: "1px solid var(--border-accent)",
              }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Product Photo Verification
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 fade-in-up stagger-1"
              style={{
                fontFamily: "var(--font-display)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Verify Before
              <br />
              <span style={{ color: "var(--accent)" }} className="text-glow">
                You Buy
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl mb-10 fade-in-up stagger-2"
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: "540px",
                margin: "0 auto 40px",
              }}
            >
              Check if a product photo is original or stolen from another
              listing. Works with Facebook Marketplace, OfferUp, Reddit, and
              more.
            </p>

            {/* CTA */}
            <div className="flex items-center justify-center gap-4 fade-in-up stagger-3">
              <Link href="/verify" className="btn-primary">
                Verify a Photo
                <ArrowRight size={18} />
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="py-24"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              How It Works
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Three steps to protect yourself from marketplace scams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              return (
                <div
                  key={i}
                  className="card p-8 text-center fade-in-up"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-5 text-xs font-bold"
                    style={{
                      background: "var(--accent-glow)",
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                      border: "1px solid var(--border-accent)",
                    }}
                  >
                    {i + 1}
                  </div>

                  <h3
                    className="text-lg font-semibold mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="py-24"
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--bg-secondary)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              Built for Trust
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Multiple verification layers working together
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="card p-6 flex items-start gap-5 fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "var(--accent-glow)",
                      border: "1px solid var(--border-accent)",
                    }}
                  >
                    <Icon
                      size={20}
                      style={{ color: "var(--accent)" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-base font-semibold mb-1.5"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section
        className="py-20"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}
          >
            Stop getting scammed.{" "}
            <span style={{ color: "var(--accent)" }}>Start verifying.</span>
          </h2>
          <p
            className="mb-8"
            style={{ color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto 32px" }}
          >
            Every check makes the community database stronger and protects the
            next buyer.
          </p>
          <Link href="/verify" className="btn-primary">
            Verify Your First Photo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 text-center"
        style={{
          borderTop: "1px solid var(--border)",
          color: "var(--text-tertiary)",
          fontSize: "13px",
          fontFamily: "var(--font-mono)",
        }}
      >
        PhotoVerify -- Product Photo Verification
      </footer>
    </div>
  );
}
