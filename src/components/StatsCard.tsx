import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accentColor?: string;
}

export function StatsCard({
  icon: Icon,
  value,
  label,
  accentColor = "var(--accent)",
}: StatsCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          <Icon size={18} style={{ color: accentColor }} />
        </div>
      </div>
      <div>
        <p
          className="text-3xl font-bold mb-1"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        <p
          className="text-sm"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-display)",
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
