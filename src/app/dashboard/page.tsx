"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldX,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Flag,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { TrustScore } from "@/components/TrustScore";

interface Stats {
  totalChecks: number;
  scamsDetected: number;
  scamReports: number;
  avgTrustScore: number;
}

interface HistoryResult {
  id: string;
  imageId: string;
  trustScore: number;
  internalMatches: Array<{ imageId: string }>;
  externalMatches: Array<{ url: string; source: string }>;
  checkedAt: string;
}

function getVerdictFromScore(score: number) {
  if (score >= 70) return { label: "Original", class: "verdict-original", icon: CheckCircle };
  if (score >= 30) return { label: "Suspicious", class: "verdict-found", icon: AlertTriangle };
  return { label: "Scam", class: "verdict-scam", icon: XCircle };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalChecks: 0,
    scamsDetected: 0,
    scamReports: 0,
    avgTrustScore: 0,
  });
  const [results, setResults] = useState<HistoryResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setResults(data.results);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold mb-3"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                }}
              >
                Dashboard
              </h1>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Overview of verification activity and community reports
              </p>
            </div>
            <Link href="/verify" className="btn-primary">
              New Check
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="fade-in-up stagger-1">
            <StatsCard
              icon={ShieldCheck}
              value={loading ? "--" : stats.totalChecks}
              label="Total Checks"
              accentColor="var(--accent)"
            />
          </div>
          <div className="fade-in-up stagger-2">
            <StatsCard
              icon={ShieldX}
              value={loading ? "--" : stats.scamsDetected}
              label="Scams Detected"
              accentColor="#ef4444"
            />
          </div>
          <div className="fade-in-up stagger-3">
            <StatsCard
              icon={Flag}
              value={loading ? "--" : stats.scamReports}
              label="Community Reports"
              accentColor="#f59e0b"
            />
          </div>
          <div className="fade-in-up stagger-4">
            <StatsCard
              icon={Activity}
              value={loading ? "--" : stats.avgTrustScore}
              label="Avg Trust Score"
              accentColor="#22c55e"
            />
          </div>
        </div>

        {/* Recent Checks */}
        <div className="card fade-in-up stagger-5" style={{ overflow: "hidden" }}>
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-tertiary)",
            }}
          >
            <h2
              className="text-sm font-semibold uppercase tracking-wider"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Recent Verifications
            </h2>
            <Clock size={14} style={{ color: "var(--text-tertiary)" }} />
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="verify-pulse flex items-center justify-center gap-2 mb-4">
                <span />
                <span />
                <span />
              </div>
              <p
                className="text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                Loading...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center">
              <p
                className="text-sm mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                No verifications yet
              </p>
              <p
                className="text-xs mb-6"
                style={{ color: "var(--text-tertiary)" }}
              >
                Start by verifying your first product photo
              </p>
              <Link href="/verify" className="btn-primary" style={{ fontSize: "13px", padding: "10px 20px" }}>
                Verify a Photo
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div
                className="grid grid-cols-[1fr_100px_120px_140px_100px] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: "var(--text-tertiary)",
                  fontFamily: "var(--font-mono)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span>ID</span>
                <span>Score</span>
                <span>Verdict</span>
                <span>Matches</span>
                <span>Time</span>
              </div>

              {/* Table Rows */}
              {results.map((result, i) => {
                const verdict = getVerdictFromScore(result.trustScore);
                const VerdictIcon = verdict.icon;
                const totalMatches =
                  result.internalMatches.length +
                  result.externalMatches.length;

                return (
                  <div
                    key={result.id}
                    className="grid grid-cols-[1fr_100px_120px_140px_100px] gap-4 px-6 py-4 items-center transition-colors fade-in"
                    style={{
                      borderBottom:
                        i < results.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                      animationDelay: `${i * 0.05}s`,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span
                      className="text-xs truncate"
                      style={{
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {result.id.slice(0, 8)}...
                    </span>

                    <div>
                      <TrustScore score={result.trustScore} size="sm" />
                    </div>

                    <span className={`verdict-badge ${verdict.class}`} style={{ fontSize: "11px", padding: "4px 10px" }}>
                      <VerdictIcon size={12} />
                      {verdict.label}
                    </span>

                    <span
                      className="text-sm"
                      style={{
                        color:
                          totalMatches > 0
                            ? "var(--warning)"
                            : "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {totalMatches} found
                    </span>

                    <span
                      className="text-xs"
                      style={{
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {new Date(result.checkedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
