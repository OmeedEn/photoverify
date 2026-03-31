"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Check, X } from "lucide-react";

const freeFeatures = [
  { text: "5 scans per month", included: true },
  { text: "TinEye + Google Lens search", included: true },
  { text: "Trust score analysis", included: true },
  { text: "Community scam database", included: true },
  { text: "Unlimited scans", included: false },
  { text: "Scan history", included: false },
  { text: "Priority processing", included: false },
];

const proFeatures = [
  { text: "Unlimited scans per month", included: true },
  { text: "TinEye + Google Lens search", included: true },
  { text: "Trust score analysis", included: true },
  { text: "Community scam database", included: true },
  { text: "Full scan history", included: true },
  { text: "Priority processing", included: true },
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div
        className="relative"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,229,204,0.06) 0%, transparent 50%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-tertiary)")
            }
          >
            <ArrowLeft size={14} />
            Back to Verify
          </Link>

          <div className="text-center max-w-2xl mx-auto">
            <h1
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              Upgrade to{" "}
              <span style={{ color: "var(--accent)" }}>Pro</span>
            </h1>
            <p
              className="text-base"
              style={{ color: "var(--text-secondary)", maxWidth: "460px", margin: "0 auto" }}
            >
              You have used all 5 free scans this month. Upgrade for unlimited
              verifications and full scan history.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Free Plan */}
          <div className="card p-8 fade-in-up stagger-1">
            <div className="mb-6">
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{
                  color: "var(--text-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Free
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  $0
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  /month
                </span>
              </div>
            </div>

            <div
              className="py-4 mb-6"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <ul className="space-y-3">
                {freeFeatures.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm"
                    style={{
                      color: feature.included
                        ? "var(--text-secondary)"
                        : "var(--text-tertiary)",
                    }}
                  >
                    {feature.included ? (
                      <Check
                        size={16}
                        style={{ color: "var(--accent)", flexShrink: 0 }}
                      />
                    ) : (
                      <X
                        size={16}
                        style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
                      />
                    )}
                    {feature.text}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="text-center text-sm py-3 rounded-lg"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-display)",
              }}
            >
              Current Plan
            </div>
          </div>

          {/* Pro Plan */}
          <div
            className="card p-8 fade-in-up stagger-2"
            style={{
              borderColor: "var(--border-accent)",
              boxShadow: "0 0 30px var(--accent-glow), 0 0 60px rgba(0, 229, 204, 0.05)",
            }}
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Pro
                </p>
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "var(--accent-glow)",
                    color: "var(--accent)",
                    border: "1px solid var(--border-accent)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                  }}
                >
                  Recommended
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ${process.env.NEXT_PUBLIC_PRO_PRICE || "4.99"}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  /month
                </span>
              </div>
            </div>

            <div
              className="py-4 mb-6"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <ul className="space-y-3">
                {proFeatures.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Check
                      size={16}
                      style={{ color: "var(--accent)", flexShrink: 0 }}
                    />
                    {feature.text}
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  background: "var(--danger-dim)",
                  color: "var(--danger)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="btn-primary w-full justify-center"
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <Shield size={16} />
              {loading ? "Redirecting..." : "Subscribe to Pro"}
            </button>

            <p
              className="text-center text-xs mt-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              Cancel anytime. Billed monthly via Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
