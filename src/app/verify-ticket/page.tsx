"use client";

import { useState } from "react";
import {
  QrCode,
  Ticket,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { UploadZone } from "@/components/UploadZone";
import { TrustScore } from "@/components/TrustScore";

interface BarcodeResultData {
  type: "qr" | "barcode" | "none";
  data: string | null;
  isDuplicate: boolean;
  previousChecks: number;
  firstSeenAt: string | null;
}

interface TicketVerificationResult {
  barcodeResult: BarcodeResultData;
  trustScore: number;
  verdict: "likely_original" | "found_elsewhere" | "known_scam";
  reasons: string[];
  imageHash: string;
}

export default function VerifyTicketPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<TicketVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    setIsVerifying(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/verify-ticket", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ticket verification failed");
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

  function getReasonIcon(reason: string) {
    if (
      reason.toLowerCase().includes("not been seen") ||
      reason.toLowerCase().includes("no duplicates")
    ) {
      return <CheckCircle size={16} style={{ color: "var(--success)" }} />;
    }
    if (
      reason.toLowerCase().includes("duplicate") ||
      reason.toLowerCase().includes("uploaded before")
    ) {
      return <XCircle size={16} style={{ color: "var(--danger)" }} />;
    }
    return <AlertTriangle size={16} style={{ color: "var(--warning)" }} />;
  }

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

          <div className="flex items-center gap-3 mb-3">
            <Ticket size={24} style={{ color: "var(--accent)" }} />
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              Verify a Ticket
            </h1>
          </div>
          <p
            className="text-sm"
            style={{ color: "var(--text-secondary)", maxWidth: "560px" }}
          >
            Catch the #1 ticket scam: the same ticket sold to multiple buyers.
            Upload a photo of your ticket and we will scan the QR code or
            barcode to check if it has been seen before.
          </p>
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
                <QrCode
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
              Scanning Ticket
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Extracting codes and checking for duplicates...
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
                "Processing image...",
                "Scanning for QR codes...",
                "Scanning for barcodes...",
                "Checking duplicate database...",
                "Generating image hash...",
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 fade-in"
                  style={{
                    animationDelay: `${i * 0.5}s`,
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
          <div className="space-y-6 fade-in-up">
            {/* Main Result Card */}
            <div
              className="card"
              style={{ padding: 0, overflow: "hidden" }}
            >
              {/* Header bar */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: "var(--bg-tertiary)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`verdict-badge ${
                      result.verdict === "likely_original"
                        ? "verdict-original"
                        : result.verdict === "found_elsewhere"
                        ? "verdict-found"
                        : "verdict-scam"
                    }`}
                  >
                    {result.verdict === "likely_original" && (
                      <ShieldCheck size={14} />
                    )}
                    {result.verdict === "found_elsewhere" && (
                      <AlertTriangle size={14} />
                    )}
                    {result.verdict === "known_scam" && (
                      <ShieldX size={14} />
                    )}
                    {result.verdict === "likely_original"
                      ? "Likely Original"
                      : result.verdict === "found_elsewhere"
                      ? "Suspicious"
                      : "Duplicate Detected"}
                  </span>
                </div>
                <span
                  className="text-xs"
                  style={{
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {new Date().toLocaleString()}
                </span>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  {/* Trust Score */}
                  <div className="flex-shrink-0">
                    <TrustScore score={result.trustScore} size="lg" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {/* Code Detection Status */}
                    <div className="mb-6">
                      <h3
                        className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{
                          color: "var(--text-tertiary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <QrCode size={13} />
                        Code Detection
                      </h3>

                      {result.barcodeResult.type === "none" ? (
                        <div
                          className="flex items-start gap-3 p-4 rounded-lg"
                          style={{
                            background: "var(--warning-dim)",
                            border: "1px solid rgba(245, 158, 11, 0.2)",
                          }}
                        >
                          <AlertTriangle
                            size={18}
                            style={{
                              color: "var(--warning)",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          />
                          <div>
                            <p
                              className="text-sm font-semibold mb-1"
                              style={{ color: "var(--warning)" }}
                            >
                              No QR code or barcode detected
                            </p>
                            <p
                              className="text-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Make sure the ticket code is clearly visible in the
                              photo. Try uploading a closer, well-lit image of the
                              QR code or barcode area.
                            </p>
                          </div>
                        </div>
                      ) : result.barcodeResult.isDuplicate ? (
                        <div
                          className="flex items-start gap-3 p-4 rounded-lg"
                          style={{
                            background: "var(--danger-dim)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                          }}
                        >
                          <ShieldX
                            size={18}
                            style={{
                              color: "var(--danger)",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          />
                          <div>
                            <p
                              className="text-sm font-semibold mb-1"
                              style={{ color: "var(--danger)" }}
                            >
                              Duplicate ticket code detected
                            </p>
                            <p
                              className="text-sm mb-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              This ticket code has been checked{" "}
                              <strong style={{ color: "var(--danger)" }}>
                                {result.barcodeResult.previousChecks} time
                                {result.barcodeResult.previousChecks !== 1
                                  ? "s"
                                  : ""}
                              </strong>{" "}
                              before. First seen on{" "}
                              <strong style={{ color: "var(--text-primary)" }}>
                                {result.barcodeResult.firstSeenAt
                                  ? new Date(
                                      result.barcodeResult.firstSeenAt
                                    ).toLocaleDateString()
                                  : "unknown date"}
                              </strong>
                              .
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                color: "var(--text-tertiary)",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              Code: {result.barcodeResult.data}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex items-start gap-3 p-4 rounded-lg"
                          style={{
                            background: "var(--success-dim)",
                            border: "1px solid rgba(34, 197, 94, 0.2)",
                          }}
                        >
                          <ShieldCheck
                            size={18}
                            style={{
                              color: "var(--success)",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          />
                          <div>
                            <p
                              className="text-sm font-semibold mb-1"
                              style={{ color: "var(--success)" }}
                            >
                              This ticket code has not been seen before
                            </p>
                            <p
                              className="text-sm mb-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              No duplicates found. This{" "}
                              {result.barcodeResult.type === "qr"
                                ? "QR code"
                                : "barcode"}{" "}
                              appears to be unique in our database.
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                color: "var(--text-tertiary)",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              Code: {result.barcodeResult.data}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Analysis Reasons */}
                    <div className="mb-6">
                      <h3
                        className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{
                          color: "var(--text-tertiary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <Ticket size={13} />
                        Analysis
                      </h3>
                      <div className="flex flex-col gap-2">
                        {result.reasons.map((reason, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-lg"
                            style={{ background: "var(--bg-tertiary)" }}
                          >
                            <span className="mt-0.5">
                              {getReasonIcon(reason)}
                            </span>
                            <span
                              className="text-sm"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Image Hash (for reference) */}
                    <div
                      className="pt-4"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <p
                        className="text-xs"
                        style={{
                          color: "var(--text-tertiary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        Image hash: {result.imageHash.slice(0, 16)}...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button onClick={handleReset} className="btn-secondary">
                Verify Another Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
