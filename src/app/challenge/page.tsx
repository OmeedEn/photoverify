"use client";

import { useState } from "react";
import {
  Fingerprint,
  Copy,
  RefreshCw,
  CheckCircle,
  Info,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const tips = [
  "Handwriting on the paper should look natural and consistent",
  "Lighting on the paper should match the lighting on the item",
  "Check edges of the paper for signs of digital editing or pasting",
  "The item should appear in the same photo, not composited together",
  "Ask for a specific angle if the first photo looks suspicious",
];

export default function ChallengePage() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<"code" | "message" | null>(null);

  const handleGenerate = () => {
    setCode(generateCode());
    setCopied(null);
  };

  const handleCopyCode = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied("code");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyMessage = async () => {
    if (!code) return;
    const message = `Before I buy, can you send a photo of the item next to a piece of paper with the code "${code}" written on it? This helps me verify the listing is real. Thanks!`;
    await navigator.clipboard.writeText(message);
    setCopied("message");
    setTimeout(() => setCopied(null), 2000);
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
            Seller Challenge
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--text-secondary)", maxWidth: "500px" }}
          >
            Generate a unique code and ask the seller to photograph it next to
            the item. This proves they actually have it.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Generate Button */}
        {!code && (
          <div className="card p-12 text-center fade-in-up">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: "var(--accent-glow)",
                border: "1px solid var(--border-accent)",
              }}
            >
              <Fingerprint
                size={28}
                style={{ color: "var(--accent)" }}
                strokeWidth={1.5}
              />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Verify a Seller Has the Item
            </h3>
            <p
              className="text-sm mb-8"
              style={{
                color: "var(--text-secondary)",
                maxWidth: "400px",
                margin: "0 auto 32px",
              }}
            >
              We will generate a unique code. Ask the seller to write it on
              paper and photograph it next to the product.
            </p>
            <button onClick={handleGenerate} className="btn-primary">
              <Fingerprint size={18} />
              Generate Challenge Code
            </button>
          </div>
        )}

        {/* Challenge Card */}
        {code && (
          <div className="space-y-6 fade-in-up">
            <div className="card" style={{ overflow: "hidden" }}>
              <div
                className="px-6 py-4"
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: "var(--bg-tertiary)",
                }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Your Challenge Code
                </span>
              </div>

              <div className="p-8 text-center">
                {/* Big Code Display */}
                <div
                  className="inline-block px-10 py-6 rounded-xl mb-6"
                  style={{
                    background: "var(--accent-glow)",
                    border: "2px solid var(--border-accent)",
                  }}
                >
                  <span
                    className="text-5xl font-bold tracking-[0.2em]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent)",
                    }}
                  >
                    {code}
                  </span>
                </div>

                <p
                  className="text-sm mb-8"
                  style={{
                    color: "var(--text-secondary)",
                    maxWidth: "420px",
                    margin: "0 auto 32px",
                  }}
                >
                  Send this code to the seller and ask them to photograph the
                  item with this code written on a piece of paper next to it.
                </p>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button onClick={handleCopyCode} className="btn-secondary">
                    {copied === "code" ? (
                      <CheckCircle size={16} style={{ color: "var(--success)" }} />
                    ) : (
                      <Copy size={16} />
                    )}
                    {copied === "code" ? "Copied" : "Copy Code"}
                  </button>
                  <button onClick={handleCopyMessage} className="btn-primary">
                    {copied === "message" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <ClipboardCheck size={16} />
                    )}
                    {copied === "message" ? "Copied" : "Copy Full Message"}
                  </button>
                  <button onClick={handleGenerate} className="btn-secondary">
                    <RefreshCw size={16} />
                    New Code
                  </button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info size={16} style={{ color: "var(--accent)" }} />
                <h3
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  What to Look For in the Response
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <CheckCircle
                      size={14}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "var(--accent)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
