import Sidebar from "@/components/Sidebar";
import { Bell, Search } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bko-bg flex">
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 px-6 py-3 flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bko-muted" />
            <input
              type="text"
              placeholder="Search calls, orders, users…"
              className="w-full bg-bko-elevated border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-bko-text placeholder:text-bko-muted focus:outline-none focus:border-bko-blue/50 transition-colors"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 bg-bko-green/10 border border-bko-green/20 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-bko-green animate-pulse" />
              <span className="text-xs font-medium text-bko-green">3 Live calls</span>
            </div>

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-xl bg-bko-elevated border border-white/5 flex items-center justify-center hover:border-white/15 transition-all">
              <Bell size={15} className="text-bko-muted" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-bko-red border border-bko-bg" />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bko-blue to-bko-cyan flex items-center justify-center text-white text-sm font-bold">
              M
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
