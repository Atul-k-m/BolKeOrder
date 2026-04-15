import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;   // positive = up, negative = down, 0 = flat
  trendLabel?: string;
  accent?: "blue" | "cyan" | "green" | "amber";
};

const ACCENT = {
  blue:  { ring: "bg-bko-blue/10 border-bko-blue/20",  icon: "text-bko-blue",  badge: "bg-bko-blue/10 text-bko-blue" },
  cyan:  { ring: "bg-bko-cyan/10 border-bko-cyan/20",  icon: "text-bko-cyan",  badge: "bg-bko-cyan/10 text-bko-cyan" },
  green: { ring: "bg-bko-green/10 border-bko-green/20", icon: "text-bko-green", badge: "bg-bko-green/10 text-bko-green" },
  amber: { ring: "bg-bko-amber/10 border-bko-amber/20", icon: "text-bko-amber", badge: "bg-bko-amber/10 text-bko-amber" },
};

export default function KpiCard({ label, value, icon: Icon, trend, trendLabel, accent = "blue" }: Props) {
  const a = ACCENT[accent];
  const TrendIcon = trend == null ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend == null ? "text-bko-muted" : trend > 0 ? "text-bko-green" : "text-bko-red";

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4 hover:border-white/15 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${a.ring} border flex items-center justify-center`}>
          <Icon size={18} className={a.icon} />
        </div>
        {trend != null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={12} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-bko-text">{value}</p>
        <p className="text-xs text-bko-muted mt-1">{label}</p>
        {trendLabel && <p className="text-xs text-bko-muted/60 mt-0.5 font-mono">{trendLabel}</p>}
      </div>
    </div>
  );
}
