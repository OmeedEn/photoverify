"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Flag,
  ChevronUp,
  Clock,
  Plus,
  X,
  ArrowLeft,
  Shield,
} from "lucide-react";
import Link from "next/link";

interface ScamReport {
  id: string;
  category: string;
  platform: string;
  description: string;
  reportedAt: string;
  upvotes: number;
}

interface ScamAlert {
  id: string;
  title: string;
  description: string;
  category: string;
  reportCount: number;
  createdAt: string;
}

const categoryOptions = [
  "Tickets",
  "Electronics",
  "Gaming",
  "Designer Goods",
  "Sneakers",
  "Other",
];

const platformOptions = [
  "Facebook Marketplace",
  "OfferUp",
  "Reddit",
  "Craigslist",
  "Other",
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const categoryColors: Record<string, string> = {
  Tickets: "#f59e0b",
  Electronics: "#3b82f6",
  Gaming: "#8b5cf6",
  "Designer Goods": "#ec4899",
  Sneakers: "#10b981",
  Other: "#6b7280",
};

export default function ScamFeedPage() {
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const [formPlatform, setFormPlatform] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchFeed() {
    try {
      const res = await fetch("/api/scam-feed");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setAlerts(data.alerts);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFeed();
  }, []);

  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!formCategory || !formPlatform || !formDescription) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/scam-feed/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formCategory,
          platform: formPlatform,
          description: formDescription,
        }),
      });
      if (res.ok) {
        setFormCategory("");
        setFormPlatform("");
        setFormDescription("");
        setShowForm(false);
        await fetchFeed();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpvote(reportId: string) {
    try {
      const res = await fetch("/api/scam-feed/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, upvotes: r.upvotes + 1 } : r
          )
        );
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div className="min-h-screen pt-16">
      <div
        className="relative"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,229,204,0.06) 0%, transparent 50%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
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

          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold mb-3"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                }}
              >
                Community Scam Feed
              </h1>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Recent scam reports and alerts from the community
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={showForm ? "btn-secondary" : "btn-primary"}
            >
              {showForm ? (
                <>
                  <X size={16} /> Cancel
                </>
              ) : (
                <>
                  <Plus size={16} /> Report a Scam
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Report Form */}
        {showForm && (
          <form
            onSubmit={handleSubmitReport}
            className="card p-6 mb-8 fade-in-up"
          >
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Submit a Scam Report
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none appearance-none cursor-pointer"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  color: formCategory
                    ? "var(--text-primary)"
                    : "var(--text-tertiary)",
                }}
              >
                <option value="">Category</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={formPlatform}
                onChange={(e) => setFormPlatform(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none appearance-none cursor-pointer"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  color: formPlatform
                    ? "var(--text-primary)"
                    : "var(--text-tertiary)",
                }}
              >
                <option value="">Platform</option>
                {platformOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Describe the scam (what happened, what to look out for)..."
              required
              minLength={10}
              rows={3}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none mb-4"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ opacity: submitting ? 0.7 : 1 }}
            >
              <Flag size={16} />
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="card p-12 text-center">
            <div className="verify-pulse flex items-center justify-center gap-2 mb-4">
              <span />
              <span />
              <span />
            </div>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Loading feed...
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-6">
            {/* Reports */}
            <div className="flex flex-col gap-4">
              {reports.map((report, i) => (
                <div
                  key={report.id}
                  className="card p-5 fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Upvote */}
                    <button
                      onClick={() => handleUpvote(report.id)}
                      className="flex flex-col items-center gap-1 pt-1 transition-colors"
                      style={{ color: "var(--text-tertiary)", minWidth: "36px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--accent)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-tertiary)")
                      }
                    >
                      <ChevronUp size={18} />
                      <span
                        className="text-xs font-semibold"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {report.upvotes}
                      </span>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-semibold"
                          style={{
                            background: `${categoryColors[report.category] || "#6b7280"}20`,
                            color:
                              categoryColors[report.category] || "#6b7280",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {report.category}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            background: "var(--bg-tertiary)",
                            color: "var(--text-tertiary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {report.platform}
                        </span>
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{
                            color: "var(--text-tertiary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          <Clock size={11} />
                          {timeAgo(report.reportedAt)}
                        </span>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alerts Sidebar */}
            <div className="flex flex-col gap-4">
              <h3
                className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <Shield size={13} />
                Active Alerts
              </h3>
              {alerts.map((alert, i) => (
                <div
                  key={alert.id}
                  className="card p-4 fade-in-up"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    borderLeft: "3px solid var(--warning)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "var(--warning)" }}
                    />
                    <div>
                      <h4
                        className="text-sm font-semibold mb-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {alert.title}
                      </h4>
                      <p
                        className="text-xs leading-relaxed mb-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {alert.description}
                      </p>
                      <span
                        className="text-xs"
                        style={{
                          color: "var(--text-tertiary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {alert.reportCount} reports
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
