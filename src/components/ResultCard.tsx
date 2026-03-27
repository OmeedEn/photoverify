"use client";

import { useState } from "react";
import {
  Globe,
  Flag,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Database,
} from "lucide-react";
import { TrustScore } from "./TrustScore";

interface ExternalMatch {
  url: string;
  source: string;
  thumbnailUrl?: string;
  title?: string;
}

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
  externalMatches: ExternalMatch[];
  stockPhotoMatch: boolean;
  scamDatabaseMatch: boolean;
  checkedAt: string;
}

interface ResultCardProps {
  result: VerificationResult;
}

function getReasonIcon(reason: string) {
  if (reason.toLowerCase().includes("no duplicates"))
    return <CheckCircle size={16} style={{ color: "var(--success)" }} />;
  if (
    reason.toLowerCase().includes("scam") ||
    reason.toLowerCase().includes("stock")
  )
    return <XCircle size={16} style={{ color: "var(--danger)" }} />;
  return <AlertTriangle size={16} style={{ color: "var(--warning)" }} />;
}

function getVerdictClass(verdict: string) {
  switch (verdict) {
    case "likely_original":
      return "verdict-original";
    case "found_elsewhere":
      return "verdict-found";
    case "known_scam":
      return "verdict-scam";
    default:
      return "verdict-found";
  }
}

function getVerdictLabel(verdict: string) {
  switch (verdict) {
    case "likely_original":
      return "Likely Original";
    case "found_elsewhere":
      return "Found Elsewhere";
    case "known_scam":
      return "Known Scam";
    default:
      return verdict;
  }
}

export function ResultCard({ result }: ResultCardProps) {
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);

  const handleReport = async () => {
    if (reported || reporting) return;
    setReporting(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: result.imageId }),
      });
      if (res.ok) {
        setReported(true);
      }
    } catch {
      // silently fail
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="card fade-in-up" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header bar */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-tertiary)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className={`verdict-badge ${getVerdictClass(result.verdict)}`}>
            {result.verdict === "likely_original" && <CheckCircle size={14} />}
            {result.verdict === "found_elsewhere" && (
              <AlertTriangle size={14} />
            )}
            {result.verdict === "known_scam" && <XCircle size={14} />}
            {getVerdictLabel(result.verdict)}
          </span>
        </div>
        <span
          className="text-xs"
          style={{
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {new Date(result.checkedAt).toLocaleString()}
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
            {/* Reasons */}
            <div className="mb-6">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{
                  color: "var(--text-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Analysis
              </h3>
              <div className="flex flex-col gap-2">
                {result.reasons.map((reason, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <span className="mt-0.5">{getReasonIcon(reason)}</span>
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

            {/* External Matches */}
            {result.externalMatches.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <Globe size={13} />
                  Found On
                </h3>
                <div className="flex flex-col gap-2">
                  {result.externalMatches.map((match, i) => (
                    <a
                      key={i}
                      href={match.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                      style={{
                        background: "var(--bg-tertiary)",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--bg-tertiary)";
                      }}
                    >
                      <ExternalLink
                        size={14}
                        style={{ color: "var(--accent)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {match.title || match.url}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {match.source}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Matches */}
            {result.internalMatches.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <Database size={13} />
                  Internal Database
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {result.internalMatches.length} similar image(s) found in our
                  database
                </p>
              </div>
            )}

            {/* Report Button */}
            <div
              className="pt-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {reported ? (
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <CheckCircle size={16} style={{ color: "var(--success)" }} />
                  Reported -- thank you for helping the community
                </div>
              ) : (
                <button
                  className="btn-danger"
                  onClick={handleReport}
                  disabled={reporting}
                >
                  <Flag size={14} />
                  {reporting ? "Reporting..." : "Report as Scam"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
