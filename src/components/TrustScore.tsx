"use client";

import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface TrustScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function getScoreColor(score: number) {
  if (score >= 70) return { main: "#22c55e", dim: "rgba(34, 197, 94, 0.15)" };
  if (score >= 30) return { main: "#f59e0b", dim: "rgba(245, 158, 11, 0.15)" };
  return { main: "#ef4444", dim: "rgba(239, 68, 68, 0.15)" };
}

function getScoreIcon(score: number) {
  if (score >= 70) return ShieldCheck;
  if (score >= 30) return ShieldAlert;
  return ShieldX;
}

export function TrustScore({ score, size = "lg" }: TrustScoreProps) {
  const color = getScoreColor(score);
  const Icon = getScoreIcon(score);

  const dimensions = {
    sm: { box: 80, radius: 30, stroke: 4, iconSize: 14, fontSize: "text-lg" },
    md: { box: 120, radius: 46, stroke: 5, iconSize: 18, fontSize: "text-3xl" },
    lg: { box: 180, radius: 70, stroke: 6, iconSize: 22, fontSize: "text-5xl" },
  };

  const d = dimensions[size];
  const circumference = 2 * Math.PI * d.radius;
  const progress = ((100 - score) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: d.box, height: d.box }}>
        <svg
          width={d.box}
          height={d.box}
          viewBox={`0 0 ${d.box} ${d.box}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={d.box / 2}
            cy={d.box / 2}
            r={d.radius}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={d.stroke}
          />
          {/* Score arc */}
          <circle
            cx={d.box / 2}
            cy={d.box / 2}
            r={d.radius}
            fill="none"
            stroke={color.main}
            strokeWidth={d.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className="score-circle"
            style={{
              filter: `drop-shadow(0 0 8px ${color.dim})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center count-up">
          <span
            className={`${d.fontSize} font-bold`}
            style={{
              color: color.main,
              fontFamily: "var(--font-mono)",
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          {size === "lg" && (
            <span
              className="text-xs mt-1 uppercase tracking-widest"
              style={{
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
              }}
            >
              Trust
            </span>
          )}
        </div>
      </div>

      {size === "lg" && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: color.dim }}
        >
          <Icon size={d.iconSize} style={{ color: color.main }} />
          <span
            className="text-sm font-semibold"
            style={{
              color: color.main,
              fontFamily: "var(--font-mono)",
            }}
          >
            {score >= 70
              ? "LIKELY ORIGINAL"
              : score >= 30
              ? "FOUND ELSEWHERE"
              : "KNOWN SCAM"}
          </span>
        </div>
      )}
    </div>
  );
}
