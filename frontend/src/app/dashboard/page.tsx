"use client";

import KpiCard from "@/components/KpiCard";
import { Phone, ShoppingCart, CheckCircle2, Clock, ExternalLink, ChevronRight } from "lucide-react";

// ── Mock data ──────────────────────────────────────────────

const ACTIVITY = [
  { id: 1, time: "18:42", lang: "Hindi",   caller: "+91 98765 XX234", intent: "Food order",   status: "active" },
  { id: 2, time: "18:41", lang: "Kannada", caller: "+91 88001 XX871", intent: "Repeat order", status: "active" },
  { id: 3, time: "18:39", lang: "English", caller: "+91 70002 XX558", intent: "Food order",   status: "completed" },
  { id: 4, time: "18:35", lang: "Tamil",   caller: "+91 91122 XX990", intent: "Food order",   status: "completed" },
  { id: 5, time: "18:29", lang: "Hindi",   caller: "+91 82009 XX113", intent: "Cancel order", status: "failed" },
  { id: 6, time: "18:22", lang: "English", caller: "+91 97765 XX340", intent: "Food order",   status: "completed" },
];

const ORDERS = [
  { id: "ORD-8821", user: "Ramaiah K.",   platform: "Swiggy",     items: "Chicken Biryani, Naan (×2)",     amount: "₹520",  status: "Placed",       time: "2m ago" },
  { id: "ORD-8820", user: "Savitri D.",   platform: "Zomato",     items: "Masala Dosa, Filter Coffee",     amount: "₹210",  status: "Delivered",    time: "14m ago" },
  { id: "ORD-8819", user: "Murugan S.",   platform: "Zepto",      items: "Samosa ×4, Lassi",               amount: "₹180",  status: "Out for del.", time: "28m ago" },
  { id: "ORD-8818", user: "Lakshmi A.",   platform: "BigBasket",  items: "Idli Sambar, Vada ×2",           amount: "₹95",   status: "Placed",       time: "35m ago" },
  { id: "ORD-8817", user: "Harish P.",    platform: "Swiggy",     items: "Paneer Butter Masala, Naan",     amount: "₹380",  status: "Failed",       time: "42m ago" },
  { id: "ORD-8816", user: "Radha M.",     platform: "Zomato",     items: "Butter Chicken, Dal Tadka, Roti","amount": "₹640", status: "Delivered",    time: "1h ago" },
];

const PLATFORM_COLORS: Record<string, string> = {
  Swiggy:    "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Zomato:    "bg-red-500/15 text-red-400 border-red-500/20",
  Zepto:     "bg-purple-500/15 text-purple-400 border-purple-500/20",
  BigBasket: "bg-green-500/15 text-green-400 border-green-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  "Placed":       "bg-bko-blue/15 text-bko-blue border-bko-blue/20",
  "Out for del.": "bg-bko-amber/15 text-bko-amber border-bko-amber/20",
  "Delivered":    "bg-bko-green/15 text-bko-green border-bko-green/20",
  "Failed":       "bg-bko-red/15 text-bko-red border-bko-red/20",
};

const LANG_COLORS: Record<string, string> = {
  Hindi:   "bg-yellow-500/15 text-yellow-400",
  Kannada: "bg-red-500/15 text-red-400",
  Tamil:   "bg-blue-500/15 text-blue-400",
  English: "bg-green-500/15 text-green-400",
};

const ACTIVITY_STATUS: Record<string, string> = {
  active:    "bg-bko-green",
  completed: "bg-bko-muted",
  failed:    "bg-bko-red",
};

// ── Language distribution data ──
const LANGS = [
  { lang: "Hindi",   pct: 42 },
  { lang: "English", pct: 28 },
  { lang: "Kannada", pct: 17 },
  { lang: "Tamil",   pct: 13 },
];
const LANG_BAR_COLORS = ["bg-yellow-400", "bg-green-400", "bg-red-400", "bg-blue-400"];

// ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-bko-text">Dashboard</h1>
          <p className="text-sm text-bko-muted mt-0.5">Tuesday, 15 April 2026 • IST</p>
        </div>
        <button className="flex items-center gap-2 bg-bko-blue hover:bg-bko-blue/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
          <Phone size={14} />
          Simulate Test Call
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total calls today"  value="142"    icon={Phone}         trend={12}  trendLabel="vs yesterday"  accent="blue" />
        <KpiCard label="Active orders"       value="28"     icon={ShoppingCart}  trend={-3}  trendLabel="right now"     accent="cyan" />
        <KpiCard label="Success rate"        value="87.3%"  icon={CheckCircle2}  trend={4}   trendLabel="orders placed" accent="green" />
        <KpiCard label="Avg call duration"   value="2m 14s" icon={Clock}         trend={-8}  trendLabel="vs last week"  accent="amber" />
      </div>

      {/* Middle row: Activity + Language */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live call feed */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-bko-text">Live Call Activity</h2>
            <span className="flex items-center gap-1.5 text-xs text-bko-green">
              <span className="w-1.5 h-1.5 rounded-full bg-bko-green animate-pulse" />
              Live
            </span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {ACTIVITY.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${ACTIVITY_STATUS[ev.status]}`} />
                <span className="font-mono text-xs text-bko-muted w-12 shrink-0">{ev.time}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LANG_COLORS[ev.lang]}`}>{ev.lang}</span>
                <span className="text-xs text-bko-muted font-mono truncate">{ev.caller}</span>
                <span className="ml-auto text-xs text-bko-text/80 shrink-0">{ev.intent}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language distribution */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display font-semibold text-bko-text mb-4">Language Mix</h2>
          <div className="space-y-3">
            {LANGS.map(({ lang, pct }, i) => (
              <div key={lang}>
                <div className="flex justify-between text-xs text-bko-muted mb-1">
                  <span>{lang}</span><span>{pct}%</span>
                </div>
                <div className="w-full bg-bko-elevated rounded-full h-2">
                  <div className={`h-2 rounded-full ${LANG_BAR_COLORS[i]} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-bko-muted mt-5 font-mono">142 calls · Today</p>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-display font-semibold text-bko-text">Recent Orders</h2>
          <button className="flex items-center gap-1 text-xs text-bko-cyan hover:text-bko-cyan/80 transition-colors">
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Order ID", "User", "Platform", "Items", "Amount", "Status", "Time", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-bko-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o, i) => (
                <tr key={o.id} className={`border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-bko-elevated/30"}`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-bko-cyan">{o.id}</td>
                  <td className="px-5 py-3.5 font-medium text-bko-text">{o.user}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[o.platform]}`}>{o.platform}</span>
                  </td>
                  <td className="px-5 py-3.5 text-bko-muted text-xs max-w-[180px] truncate">{o.items}</td>
                  <td className="px-5 py-3.5 font-semibold text-bko-text">{o.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status] || "bg-bko-muted/10 text-bko-muted border-bko-muted/20"}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-bko-muted text-xs">{o.time}</td>
                  <td className="px-5 py-3.5">
                    <button className="text-bko-muted hover:text-bko-text transition-colors"><ExternalLink size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
