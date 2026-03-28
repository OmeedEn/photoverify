"use client";

import { useState } from "react";
import {
  Search,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  QrCode,
  ScanEye,
  Layers,
  AudioWaveform,
  FileWarning,
  Globe,
  Database,
  Flag,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { UploadZone } from "@/components/UploadZone";
import { TrustScore } from "@/components/TrustScore";

interface ScanResult {
  verification: {
    id: string;
    imageId: string;
    trustScore: number;
    verdict: string;
    reasons: string[];
    internalMatches: Array<{
      imageId: string;
      similarity: number;
      reportedAsScam: boolean;
    }>;
    externalMatches: Array<{
      url: string;
      source: string;
      title?: string;
    }>;
    scamDatabaseMatch: boolean;
    checkedAt: string;
  };
  forensics: {
    score: number;
    verdict: string;
    signals: string[];
    metadata: Array<{
      tool: string;
      confidence: string;
      detail: string;
    }>;
    ela: {
      suspiciousRegions: number;
      avgDeviation: number;
      isManipulated: boolean;
    };
    noise: {
      uniformity: number;
      isAIGenerated: boolean;
    };
  };
  barcode: {
    type: string;
    data: string | null;
    isDuplicate: boolean;
    previousChecks: number;
    firstSeenAt: string | null;
  };
}

function getVerdictConfig(verdict: string) {
  switch (verdict) {
    case "likely_original":
    case "likely_authentic":
      return { class: "verdict-original", label: "Likely Original", icon: CheckCircle };
    case "found_elsewhere":
    case "possibly_edited":
      return { class: "verdict-found", label: "Needs Attention", icon: AlertTriangle };
    case "known_scam":
    case "likely_manipulated":
      return { class: "verdict-scam", label: "High Risk", icon: XCircle };
    default:
      return { class: "verdict-found", label: verdict, icon: AlertTriangle };
  }
}

export default function VerifyPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  const handleImageSelect = async (file: File) => {
    setIsVerifying(true);
    setResult(null);
    setError(null);
    setReported(false);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Scan failed");
      }

      setResult(await response.json());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReport = async () => {
    if (!result || reported) return;
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: result.verification.imageId }),
      });
      setReported(true);
    } catch {
      // silently fail
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setReported(false);
  };

  // Calculate combined score
  const combinedScore = result
    ? Math.round(
        result.verification.trustScore * 0.5 +
        result.forensics.score * 0.35 +
        (result.barcode.isDuplicate ? 0 : result.barcode.type === "none" ? 50 : 100) * 0.15
      )
    : 0;

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
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <h1
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
          >
            Full Image Scan
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)", maxWidth: "540px" }}>
            Upload once -- we run duplicate detection, AI/Photoshop forensics, and QR/barcode
            scanning all at the same time.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="mb-8">
          <UploadZone onImageSelect={handleImageSelect} disabled={isVerifying} />
        </div>

        {/* Loading */}
        {isVerifying && (
          <div className="card p-12 text-center fade-in">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div
                className="w-20 h-20 rounded-full pulse-ring"
                style={{ border: "2px solid var(--accent)", opacity: 0.3, position: "absolute" }}
              />
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "var(--accent-glow)", border: "1px solid var(--border-accent)" }}
              >
                <Search size={24} style={{ color: "var(--accent)" }} className="animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Running Full Scan
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              All checks running in parallel...
            </p>
            <div className="verify-pulse flex items-center justify-center gap-2">
              <span /><span /><span />
            </div>
            <div className="mt-8 flex flex-col gap-2 max-w-sm mx-auto text-left" style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
              {[
                "Generating perceptual hash...",
                "Checking duplicate database...",
                "Scanning for QR/barcodes...",
                "Running AI detection analysis...",
                "Error Level Analysis (ELA)...",
                "Noise pattern analysis...",
                "Searching TinEye + Google Lens...",
                "Calculating combined trust score...",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 fade-in" style={{ animationDelay: `${i * 0.4}s`, color: "var(--text-tertiary)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)", opacity: 0.6 }} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card p-6 fade-in-up" style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}>
            <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
            <button onClick={handleReset} className="btn-secondary mt-4" style={{ fontSize: "13px", padding: "8px 16px" }}>
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 fade-in-up">

            {/* Combined Score Header */}
            <div className="card p-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <TrustScore score={combinedScore} size="lg" />
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    Combined Trust Score
                  </h2>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                    Weighted average across duplicate detection, AI forensics, and barcode analysis.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const v = getVerdictConfig(result.verification.verdict);
                      const Icon = v.icon;
                      return <span className={`verdict-badge ${v.class}`}><Icon size={13} /> Photo: {v.label}</span>;
                    })()}
                    {(() => {
                      const v = getVerdictConfig(result.forensics.verdict);
                      const Icon = v.icon;
                      return <span className={`verdict-badge ${v.class}`}><Icon size={13} /> AI Check: {v.label}</span>;
                    })()}
                    {result.barcode.type !== "none" && (
                      <span className={`verdict-badge ${result.barcode.isDuplicate ? "verdict-scam" : "verdict-original"}`}>
                        {result.barcode.isDuplicate ? <XCircle size={13} /> : <CheckCircle size={13} />}
                        QR: {result.barcode.isDuplicate ? "Duplicate" : "Unique"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Duplicate Detection */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-tertiary)" }}>
                <Search size={15} style={{ color: "var(--accent)" }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                  Duplicate Detection
                </h3>
                <div className="ml-auto">
                  <TrustScore score={result.verification.trustScore} size="sm" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-2 mb-4">
                  {result.verification.reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                      {reason.includes("No duplicates") ? (
                        <CheckCircle size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                      ) : (
                        <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--warning)" }} />
                      )}
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{reason}</span>
                    </div>
                  ))}
                </div>
                {result.verification.externalMatches.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      <Globe size={12} /> Found On
                    </h4>
                    {result.verification.externalMatches.map((match, i) => (
                      <a key={i} href={match.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors" style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", textDecoration: "none" }}>
                        <ExternalLink size={13} style={{ color: "var(--accent)" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{match.title || match.url}</p>
                          <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{match.source}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                {result.verification.internalMatches.length > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                    <Database size={13} style={{ color: "var(--warning)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {result.verification.internalMatches.length} match(es) in internal database
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: AI / Photoshop Forensics */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-tertiary)" }}>
                <ScanEye size={15} style={{ color: "var(--accent)" }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                  AI / Photoshop Detection
                </h3>
                <div className="ml-auto">
                  <TrustScore score={result.forensics.score} size="sm" />
                </div>
              </div>
              <div className="p-6">
                {/* Signals */}
                <div className="flex flex-col gap-2 mb-5">
                  {result.forensics.signals.map((signal, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                      {signal.includes("No signs") ? (
                        <CheckCircle size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                      ) : signal.includes("AI generation") ? (
                        <XCircle size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--danger)" }} />
                      ) : (
                        <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--warning)" }} />
                      )}
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{signal}</span>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                {result.forensics.metadata.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      <FileWarning size={12} /> Metadata
                    </h4>
                    {result.forensics.metadata.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg mb-1" style={{ background: "var(--bg-tertiary)" }}>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0" style={{
                          background: m.confidence === "high" ? "var(--danger-dim)" : m.confidence === "medium" ? "var(--warning-dim)" : "var(--bg-elevated)",
                          color: m.confidence === "high" ? "var(--danger)" : m.confidence === "medium" ? "var(--warning)" : "var(--text-tertiary)",
                          fontFamily: "var(--font-mono)",
                        }}>
                          {m.confidence}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{m.detail}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ELA + Noise bars */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Layers size={14} style={{ color: "var(--accent)" }} />
                      <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>ELA</span>
                      <span className="ml-auto text-lg font-bold" style={{ fontFamily: "var(--font-mono)", color: result.forensics.ela.isManipulated ? "var(--danger)" : "var(--accent)" }}>
                        {result.forensics.ela.suspiciousRegions}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, result.forensics.ela.suspiciousRegions * 3)}%`, background: result.forensics.ela.isManipulated ? "var(--danger)" : "var(--accent)" }} />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                      {result.forensics.ela.isManipulated ? "Suspicious regions detected" : "Error levels consistent"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AudioWaveform size={14} style={{ color: "var(--accent)" }} />
                      <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>Noise</span>
                      <span className="ml-auto text-lg font-bold" style={{ fontFamily: "var(--font-mono)", color: result.forensics.noise.isAIGenerated ? "var(--danger)" : "var(--accent)" }}>
                        {result.forensics.noise.uniformity}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                      <div className="h-full rounded-full" style={{ width: `${result.forensics.noise.uniformity}%`, background: result.forensics.noise.isAIGenerated ? "var(--danger)" : "var(--accent)" }} />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                      {result.forensics.noise.isAIGenerated ? "Unnaturally uniform (AI-like)" : "Natural noise pattern"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: QR/Barcode (only if detected) */}
            {result.barcode.type !== "none" && (
              <div className="card" style={{ overflow: "hidden" }}>
                <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-tertiary)" }}>
                  <QrCode size={15} style={{ color: "var(--accent)" }} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    QR / Barcode Scan
                  </h3>
                </div>
                <div className="p-6">
                  {result.barcode.isDuplicate ? (
                    <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.25)" }}>
                      <XCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--danger)" }}>
                          Duplicate Code Detected
                        </p>
                        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                          This code has been checked {result.barcode.previousChecks} time(s) before.
                          First seen {result.barcode.firstSeenAt ? new Date(result.barcode.firstSeenAt).toLocaleDateString() : "unknown"}.
                          This is a strong indicator the same ticket is being sold to multiple buyers.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: "var(--success-dim)", border: "1px solid rgba(34,197,94,0.25)" }}>
                      <CheckCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>
                          Unique Code
                        </p>
                        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                          This QR code has not been seen before in our system.
                        </p>
                      </div>
                    </div>
                  )}
                  {result.barcode.data && (
                    <p className="text-xs mt-3 truncate" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      Code: {result.barcode.data.slice(0, 60)}{result.barcode.data.length > 60 ? "..." : ""}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Report + Reset */}
            <div className="flex items-center justify-between">
              <div>
                {reported ? (
                  <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <CheckCircle size={15} style={{ color: "var(--success)" }} />
                    Reported -- thank you
                  </span>
                ) : (
                  <button className="btn-danger" onClick={handleReport}>
                    <Flag size={14} />
                    Report as Scam
                  </button>
                )}
              </div>
              <button onClick={handleReset} className="btn-secondary">
                Scan Another Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
