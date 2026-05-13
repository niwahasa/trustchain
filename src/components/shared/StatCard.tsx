import { type ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: ReactNode;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  trend,
  trendUp = true,
  icon,
  accentColor = "#00d4ff",
}: StatCardProps) {
  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-40"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-medium text-trust-text-secondary uppercase tracking-wider">
          {label}
        </span>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          {icon}
        </div>
      </div>
      <p className="font-syne font-bold text-3xl text-trust-text mb-2">
        {value}
      </p>
      {trend && (
        <div className="flex items-center gap-1.5">
          {trendUp ? (
            <TrendingUp className="w-3.5 h-3.5 text-trust-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-trust-danger" />
          )}
          <span
            className={cn(
              "font-mono-code text-xs",
              trendUp ? "text-trust-success" : "text-trust-danger"
            )}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
