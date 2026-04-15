"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Phone, ShoppingCart, Users, Brain,
  BarChart2, Settings, ChevronRight, Zap, LogOut, Building2
} from "lucide-react";

const NAV = [
  { label: "Dashboard",  href: "/dashboard",            icon: LayoutDashboard },
  { label: "Calls",      href: "/dashboard/calls",       icon: Phone,          badge: 3 },
  { label: "Orders",     href: "/dashboard/orders",      icon: ShoppingCart,   badge: 12 },
  { label: "Users",      href: "/dashboard/users",       icon: Users },
  { label: "Memory",     href: "/dashboard/memory",      icon: Brain },
  { label: "Analytics",  href: "/dashboard/analytics",   icon: BarChart2 },
  { label: "Settings",   href: "/dashboard/settings",    icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-60 fixed left-0 top-0 z-40 flex flex-col glass border-r border-white/5">
      {/* Logo + Tenant */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bko-blue to-bko-cyan flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-display text-white font-bold text-lg tracking-tight">BolKeOrder</span>
        </div>
        {/* Tenant badge (multi-instance indicator) */}
        <div className="flex items-center gap-2 bg-bko-elevated px-3 py-2 rounded-xl border border-white/5">
          <Building2 size={13} className="text-bko-cyan shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-bko-muted">Operator</p>
            <p className="text-xs font-semibold text-bko-text truncate">Meghana Foods Co.</p>
          </div>
          <ChevronRight size={13} className="text-bko-muted ml-auto shrink-0" />
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-bko-blue/15 text-bko-blue border border-bko-blue/20"
                  : "text-bko-muted hover:text-bko-text hover:bg-white/5"
              }`}
            >
              <Icon size={17} className={active ? "text-bko-blue" : "text-bko-muted group-hover:text-bko-text"} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  label === "Calls" ? "bg-bko-green/20 text-bko-green" : "bg-bko-amber/20 text-bko-amber"
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Demo link */}
      <div className="px-3 pb-3">
        <Link href="/demo" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-bko-muted hover:text-bko-text hover:bg-white/5 transition-all">
          <Zap size={14} className="text-bko-cyan" />
          Try Voice Demo
        </Link>
      </div>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-white/5 pt-4">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-bko-muted hover:text-bko-red hover:bg-bko-red/10 transition-all">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
