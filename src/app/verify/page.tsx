"use client";

import { useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UploadZone } from "@/components/UploadZone";
import { ResultCard } from "@/components/ResultCard";

interface VerificationResult {
  id: string;
  imageId: string;
  trustScore: number;
  verdict: "likely_original" | "found_elsewhere" | "known_scam";
  reasons: string[];
  internalMatches: Array<{
    imageId: string;
    similarity: number;
    reportedAsScam: boolean;
  }>;
  externalMatches: Array<{
    url: string;
    source: string;
    thumbnailUrl?: string;
    title?: string;
  }>;
  stockPhotoMatch: boolean;
  scamDatabaseMatch: boolean;
  checkedAt: string;
}

export default function VerifyPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    setIsVerifying(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Verification failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
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

          <div>
            <h1
              className="text-2xl font-bold mb-3"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              Verify a Product Photo
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)", maxWidth: "500px" }}
            >
              Upload or paste a photo from a marketplace listing. We will check it
              against our database and the web for duplicates.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Upload Zone */}
        <div className="mb-8">
          <UploadZone onImageSelect={handleImageSelect} disabled={isVerifying} />
        </div>

        {/* Loading State */}
        {isVerifying && (
          <div className="card p-12 text-center fade-in">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div
                className="w-20 h-20 rounded-full pulse-ring"
                style={{
                  border: "2px solid var(--accent)",
                  opacity: 0.3,
                  position: "absolute",
                }}
              />
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--accent-glow)",
                  border: "1px solid var(--border-accent)",
                }}
              >
                <Search
                  size={24}
                  style={{ color: "var(--accent)" }}
                  className="animate-pulse"
                />
              </div>
            </div>

            <h3
              className="text-lg font-semibold mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Verifying Image
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Scanning databases and the web for matches...
            </p>

            <div className="verify-pulse flex items-center justify-center gap-2">
              <span />
              <span />
              <span />
            </div>

            <div
              className="mt-8 flex flex-col gap-2 max-w-xs mx-auto text-left"
              style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
            >
              {[
                "Generating image hash...",
                "Checking internal database...",
                "Searching TinEye (50B+ images)...",
                "Searching Google Lens...",
                "Calculating trust score...",
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 fade-in"
                  style={{
                    animationDelay: `${i * 0.6}s`,
                    color: "var(--text-tertiary)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--accent)", opacity: 0.6 }}
                  />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className="card p-6 fade-in-up"
            style={{
              borderColor: "rgba(239, 68, 68, 0.3)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              {error}
            </p>
            <button
              onClick={handleReset}
              className="btn-secondary mt-4"
              style={{ fontSize: "13px", padding: "8px 16px" }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <ResultCard result={result} />

            <div className="text-center">
              <button onClick={handleReset} className="btn-secondary">
                Verify Another Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
