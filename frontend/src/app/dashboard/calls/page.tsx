"use client";

import { useState, useEffect } from "react";
import { Phone, PhoneOff, AlertCircle, Clock, Mic, Languages, CheckCircle2, RefreshCw, ExternalLink, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Mock Data ───────────────────────────────────────────────

type CallStatus = "active" | "completed" | "failed" | "on_hold";

type Call = {
  id: string;
  caller: string;
  duration: number;  // seconds
  language: string;
  intent: string;
  confidence: number;
  transcript: string;
  status: CallStatus;
  startedAt: string;
  restaurant?: string;
};

const MOCK_ACTIVE: Call[] = [
  {
    id: "c001", caller: "+91 XXXXX XX789", duration: 87, language: "Hindi",
    intent: "Food order", confidence: 92,
    transcript: "…haan, ek chicken biryani aur do butter naan bhej dena, Meghana Foods se…",
    status: "active", startedAt: "18:42", restaurant: "Meghana Foods",
  },
  {
    id: "c002", caller: "+91 XXXXX XX234", duration: 43, language: "Kannada",
    intent: "Repeat order", confidence: 78,
    transcript: "…naanu nodidde, nange same order beku, last week thariddu…",
    status: "active", startedAt: "18:43", restaurant: "Hotel Darshini",
  },
  {
    id: "c003", caller: "+91 XXXXX XX556", duration: 12, language: "Tamil",
    intent: "Food order", confidence: 55,
    transcript: "…enakku oru masala dosa vendum, extra chutney…",
    status: "active", startedAt: "18:44",
  },
];

const MOCK_QUEUE: { id: string; caller: string; waitSince: string; lang: string }[] = [
  { id: "q1", caller: "+91 XXXXX XX901", waitSince: "0:42", lang: "Hindi" },
  { id: "q2", caller: "+91 XXXXX XX128", waitSince: "1:15", lang: "English" },
];

const INITIAL_RECENT: Call[] = [
  { id: "c010", caller: "+91 XXXXX XX112", duration: 134, language: "Hindi",   intent: "Food order",   confidence: 96, transcript: "Chicken biryani aur do naan", status: "completed", startedAt: "18:29" },
  { id: "c011", caller: "+91 XXXXX XX445", duration: 78,  language: "English", intent: "Food order",   confidence: 88, transcript: "I'd like idli vada and a filter coffee", status: "completed", startedAt: "18:21" },
  { id: "c012", caller: "+91 XXXXX XX778", duration: 22,  language: "Tamil",   intent: "Cancel order", confidence: 91, transcript: "Order cancel panni",       status: "failed",    startedAt: "18:15" },
  { id: "c013", caller: "+91 XXXXX XX334", duration: 198, language: "Kannada", intent: "Repeat order", confidence: 83, transcript: "Same as last time",        status: "completed", startedAt: "17:58" },
  { id: "c014", caller: "+91 XXXXX XX667", duration: 45,  language: "Hindi",   intent: "Food order",   confidence: 61, transcript: "Woh…mutton biryani bhejna", status: "completed", startedAt: "17:45" },
];

// ── Helpers ──────────────────────────────────────────────────

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const LANG_COLORS: Record<string, string> = {
  Hindi:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  English: "bg-green-500/15 text-green-400 border-green-500/20",
  Kannada: "bg-red-500/15 text-red-400 border-red-500/20",
  Tamil:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Telugu:  "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

const CONF_COLOR = (v: number) =>
  v >= 85 ? "bg-bko-green" : v >= 65 ? "bg-bko-amber" : "bg-bko-red";

// ── Sub-components ────────────────────────────────────────────

function ActiveCallCard({ call }: { call: Call }) {
  const [secs, setSecs] = useState(call.duration);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 border border-bko-green/20 relative overflow-hidden"
    >
      {/* Live pulse ring */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-bko-green animate-pulse" />
        <span className="text-xs text-bko-green font-medium">LIVE</span>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-bko-green/15 border border-bko-green/25 flex items-center justify-center">
          <Phone size={16} className="text-bko-green" />
        </div>
        <div>
          <p className="font-mono text-sm font-bold text-bko-text">{call.caller}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${LANG_COLORS[call.language] || "bg-bko-elevated text-bko-muted"}`}>{call.language}</span>
            <span className="text-xs bg-bko-blue/15 text-bko-blue border border-bko-blue/20 px-2 py-0.5 rounded-full">{call.intent}</span>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 mb-3">
        <Clock size={12} className="text-bko-muted" />
        <span className="font-mono text-lg font-bold text-bko-text">{formatDuration(secs)}</span>
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-bko-muted mb-1.5">
          <span>Confidence</span><span className={call.confidence >= 85 ? "text-bko-green" : call.confidence >= 65 ? "text-bko-amber" : "text-bko-red"}>{call.confidence}%</span>
        </div>
        <div className="w-full bg-bko-elevated h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${call.confidence}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-2 rounded-full ${CONF_COLOR(call.confidence)}`}
          />
        </div>
      </div>

      {/* Live transcript */}
      <div className="bg-bko-elevated rounded-xl p-3 text-xs text-bko-muted font-mono leading-relaxed border border-white/5 max-h-16 overflow-hidden mb-4">
        <span className="text-bko-text">{call.transcript}</span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block w-0.5 h-3 bg-bko-cyan ml-0.5 align-middle"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 text-xs font-medium bg-bko-elevated hover:bg-bko-elevated/80 border border-white/5 text-bko-text px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5">
          <ExternalLink size={11} /> Transcript
        </button>
        <button className="flex-1 text-xs font-medium bg-bko-amber/10 hover:bg-bko-amber/20 border border-bko-amber/20 text-bko-amber px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5">
          <Mic size={11} /> Intervene
        </button>
        <button className="flex-1 text-xs font-medium bg-bko-red/10 hover:bg-bko-red/20 border border-bko-red/20 text-bko-red px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5">
          <PhoneOff size={11} /> End
        </button>
      </div>
    </motion.div>
  );
}

// ── Page ────────────────────────────────────────────────────

export default function CallsPage() {
  const [filter, setFilter] = useState<CallStatus | "all">("all");
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const recent = INITIAL_RECENT.filter(c => filter === "all" || c.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-bko-text">Live Calls</h1>
          <p className="text-sm text-bko-muted mt-0.5">Real-time monitoring · Vapi webhook connected</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Vapi status */}
          <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-bko-green animate-pulse" />
            <span className="text-bko-green font-medium">Vapi Connected</span>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-bko-muted hover:text-bko-text glass px-3 py-2 rounded-xl transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Active Calls Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-bko-green animate-pulse" />
          <h2 className="font-display font-semibold text-bko-text">Active Calls ({MOCK_ACTIVE.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {MOCK_ACTIVE.map(call => <ActiveCallCard key={call.id} call={call} />)}
        </div>
      </div>

      {/* Queue */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-display font-semibold text-bko-text mb-3 flex items-center gap-2">
          <Clock size={15} className="text-bko-amber" />
          Queue ({MOCK_QUEUE.length} waiting)
        </h2>
        <div className="flex flex-wrap gap-3">
          {MOCK_QUEUE.map(q => (
            <div key={q.id} className="flex items-center gap-3 bg-bko-elevated border border-bko-amber/20 rounded-xl px-4 py-2.5">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${LANG_COLORS[q.lang] || "text-bko-muted"}`}>{q.lang}</span>
              <span className="font-mono text-sm text-bko-text">{q.caller}</span>
              <span className="text-xs text-bko-amber flex items-center gap-1"><Clock size={10} />{q.waitSince}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Calls Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-display font-semibold text-bko-text">Recent Calls</h2>
          {/* Filters */}
          <div className="flex gap-2">
            {(["all", "completed", "failed"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                  filter === f
                    ? "bg-bko-blue border-bko-blue/50 text-white"
                    : "border-white/10 text-bko-muted hover:text-bko-text"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["Caller", "Duration", "Language", "Intent", "Confidence", "Status", "Time", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-bko-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((call, i) => (
              <tr key={call.id}
                className={`border-b border-white/5 last:border-0 hover:bg-white/3 cursor-pointer transition-colors ${i % 2 === 0 ? "" : "bg-bko-elevated/20"}`}
                onClick={() => setSelectedCall(call)}
              >
                <td className="px-5 py-3.5 font-mono text-xs text-bko-cyan">{call.caller}</td>
                <td className="px-5 py-3.5 font-mono text-sm text-bko-text">{formatDuration(call.duration)}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${LANG_COLORS[call.language] || ""}`}>{call.language}</span>
                </td>
                <td className="px-5 py-3.5 text-bko-muted text-xs">{call.intent}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-bko-elevated h-1.5 rounded-full">
                      <div className={`h-1.5 rounded-full ${CONF_COLOR(call.confidence)}`} style={{ width: `${call.confidence}%` }} />
                    </div>
                    <span className="text-xs text-bko-muted">{call.confidence}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    call.status === "completed" ? "bg-bko-green/15 text-bko-green border-bko-green/20"
                    : call.status === "failed"   ? "bg-bko-red/15 text-bko-red border-bko-red/20"
                    : "bg-bko-muted/10 text-bko-muted border-white/10"
                  }`}>
                    {call.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-bko-muted text-xs font-mono">{call.startedAt}</td>
                <td className="px-5 py-3.5">
                  <ExternalLink size={13} className="text-bko-muted" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Call detail modal */}
      <AnimatePresence>
        {selectedCall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCall(null)}
          >
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-lg border border-white/10"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-white">Call Detail</h3>
                <button onClick={() => setSelectedCall(null)} className="text-bko-muted hover:text-bko-text">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-bko-elevated rounded-xl p-3">
                    <p className="text-bko-muted text-xs mb-1">Caller</p>
                    <p className="font-mono text-bko-text">{selectedCall.caller}</p>
                  </div>
                  <div className="bg-bko-elevated rounded-xl p-3">
                    <p className="text-bko-muted text-xs mb-1">Duration</p>
                    <p className="font-mono text-bko-text">{formatDuration(selectedCall.duration)}</p>
                  </div>
                  <div className="bg-bko-elevated rounded-xl p-3">
                    <p className="text-bko-muted text-xs mb-1">Language</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${LANG_COLORS[selectedCall.language]}`}>{selectedCall.language}</span>
                  </div>
                  <div className="bg-bko-elevated rounded-xl p-3">
                    <p className="text-bko-muted text-xs mb-1">Confidence</p>
                    <p className="text-bko-text">{selectedCall.confidence}%</p>
                  </div>
                </div>

                <div className="bg-bko-elevated rounded-xl p-4">
                  <p className="text-bko-muted text-xs mb-2">Transcript</p>
                  <p className="text-sm text-bko-text font-mono leading-relaxed">"{selectedCall.transcript}"</p>
                </div>

                <div className="bg-bko-elevated rounded-xl p-4">
                  <p className="text-bko-muted text-xs mb-2">Parsed Intent</p>
                  <pre className="text-xs text-bko-cyan font-mono">{JSON.stringify({ intent: selectedCall.intent, status: selectedCall.status, language: selectedCall.language }, null, 2)}</pre>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
