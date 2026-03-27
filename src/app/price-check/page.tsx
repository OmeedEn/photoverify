"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { TrustScore } from "@/components/TrustScore";
import { CATEGORIES } from "@/lib/price-check";

interface PriceResult {
  verdict: "fair" | "suspicious" | "likely_scam";
  score: number;
  reason: string;
  marketRange: { min: number; max: number; avg: number };
  percentBelowAvg: number;
}

const verdictConfig = {
  fair: { class: "verdict-original", label: "Fair Price", icon: CheckCircle },
  suspicious: { class: "verdict-found", label: "Suspicious", icon: AlertTriangle },
  likely_scam: { class: "verdict-scam", label: "Likely Scam", icon: XCircle },
};

export default function PriceCheckPage() {
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !price) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/price-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, price: parseFloat(price) }),
      });
      if (res.ok) {
        setResult(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div
        className="relative"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,229,204,0.06) 0%, transparent 50%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
          <Link
            href="/"
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
            Back to Home
          </Link>

          <h1
            className="text-2xl font-bold mb-3"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}
          >
            Price Check
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--text-secondary)", maxWidth: "500px" }}
          >
            Enter what you are buying and the asking price. We will tell you if
            the deal is too good to be true.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Form */}
        <form onSubmit={handleCheck} className="card p-6 mb-8 fade-in-up">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                className="block text-sm mb-2"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                }}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all appearance-none cursor-pointer"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  color: category ? "var(--text-primary)" : "var(--text-tertiary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                <option value="">Select a category</option>
                {Object.keys(CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-sm mb-2"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                }}
              >
                Asking Price ($)
              </label>
              <div className="relative">
                <DollarSign
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !category || !price}
            className="btn-primary"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            <DollarSign size={16} />
            {loading ? "Checking..." : "Check Price"}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="card fade-in-up" style={{ overflow: "hidden" }}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-tertiary)",
              }}
            >
              <span
                className={`verdict-badge ${verdictConfig[result.verdict].class}`}
              >
                {(() => {
                  const Icon = verdictConfig[result.verdict].icon;
                  return <Icon size={14} />;
                })()}
                {verdictConfig[result.verdict].label}
              </span>
              {result.percentBelowAvg > 0 && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{
                    color:
                      result.verdict === "fair"
                        ? "var(--text-tertiary)"
                        : "var(--warning)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <TrendingDown size={13} />
                  {result.percentBelowAvg}% below avg
                </span>
              )}
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <TrustScore score={result.score} size="lg" />
                </div>

                <div className="flex-1">
                  {/* Reason */}
                  <div
                    className="p-4 rounded-lg mb-6"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {result.reason}
                    </p>
                  </div>

                  {/* Market Range Bar */}
                  <div className="mb-6">
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Market Range for {category}
                    </h4>
                    <div className="relative">
                      <div
                        className="h-2 rounded-full"
                        style={{ background: "var(--bg-elevated)" }}
                      />
                      {/* Average marker */}
                      <div
                        className="absolute top-0 h-2 w-0.5"
                        style={{
                          left: `${((result.marketRange.avg - result.marketRange.min) / (result.marketRange.max - result.marketRange.min)) * 100}%`,
                          background: "var(--text-secondary)",
                        }}
                      />
                      {/* Asking price marker */}
                      <div
                        className="absolute -top-1 w-4 h-4 rounded-full"
                        style={{
                          left: `${Math.max(0, Math.min(100, ((parseFloat(price) - result.marketRange.min) / (result.marketRange.max - result.marketRange.min)) * 100))}%`,
                          transform: "translateX(-50%)",
                          background:
                            result.verdict === "fair"
                              ? "var(--success)"
                              : result.verdict === "suspicious"
                              ? "var(--warning)"
                              : "var(--danger)",
                          border: "2px solid var(--bg-secondary)",
                        }}
                      />
                      {/* Labels */}
                      <div
                        className="flex justify-between mt-2 text-xs"
                        style={{
                          color: "var(--text-tertiary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <span>${result.marketRange.min}</span>
                        <span>avg ${result.marketRange.avg}</span>
                        <span>${result.marketRange.max}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tip */}
                  <div
                    className="p-3 rounded-lg flex items-start gap-3"
                    style={{
                      background: "var(--bg-tertiary)",
                      borderLeft: "3px solid var(--accent)",
                    }}
                  >
                    <AlertTriangle
                      size={14}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "var(--accent)" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Prices significantly below market value are the #1
                      indicator of marketplace scams. If a deal seems too good
                      to be true, it usually is.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
