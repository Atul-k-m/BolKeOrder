"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone, Brain, CheckCircle2, Zap, Code2, Mail, Star } from "lucide-react";

// ── Animated SVG Waveform ──
function Waveform() {
  return (
    <div className="flex items-end justify-center gap-1 h-16">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="wave-bar w-2 rounded-full animate-wave"
          style={{
            animationDelay: `${i * 0.1}s`,
            height: `${20 + Math.sin((i / 11) * Math.PI) * 40}px`,
            background: i % 3 === 0
              ? "linear-gradient(to top, #2563EB, #06B6D4)"
              : i % 3 === 1
              ? "linear-gradient(to top, #06B6D4, #10B981)"
              : "rgba(255,255,255,0.15)",
          }}
        />
      ))}
    </div>
  );
}

// ── Platform placeholder cards ──
const PLATFORMS = [
  { name: "Swiggy",     color: "#FF5200", bg: "from-orange-500/20 to-orange-500/5",   border: "border-orange-500/30" },
  { name: "Zomato",     color: "#E23744", bg: "from-red-500/20 to-red-500/5",         border: "border-red-500/30" },
  { name: "Zepto",      color: "#8B5CF6", bg: "from-purple-500/20 to-purple-500/5",   border: "border-purple-500/30" },
  { name: "BigBasket",  color: "#84CC16", bg: "from-green-500/20 to-green-500/5",     border: "border-green-500/30" },
];

// ── Testimonials ──
const TESTIMONIALS = [
  { name: "Ramaiah K.", age: 72, city: "Bengaluru", review: "Pehle smartphone use karna bahut mushkil tha. Ab bas bolta hoon aur order ho jaata hai!", lang: "Hindi" },
  { name: "Savitri D.", age: 68, city: "Chennai",   review: "Naan phone-il pesivittu biryani vanguvom. Romba easy-a irukku!", lang: "Tamil" },
  { name: "Murugan S.", age: 74, city: "Mysuru",    review: "My grandson set it up. Now I just call and food comes. God bless this idea!", lang: "English" },
];

// ── Steps ──
const STEPS = [
  { icon: Phone, title: "User Calls",         desc: "Elderly user calls on a regular phone number — no app needed.", color: "from-bko-blue to-blue-600" },
  { icon: Brain, title: "AI Understands",     desc: "Vapi + GPT-4o parses vernacular speech and extracts the full order intent.", color: "from-bko-cyan to-cyan-600" },
  { icon: CheckCircle2, title: "Order Placed", desc: "Cart confirmed, platform API called, confirmation SMS sent in 30 seconds.", color: "from-bko-green to-green-600" },
];

// ── Component ──
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bko-bg text-bko-text overflow-x-hidden">
      
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bko-blue to-bko-cyan flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">BolKeOrder</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-bko-muted">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#platforms" className="hover:text-white transition-colors">Platforms</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Stories</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-bko-muted hover:text-white transition-colors">Sign in</Link>
            <Link href="/demo" className="text-sm font-medium bg-bko-blue hover:bg-bko-blue/90 text-white px-4 py-2 rounded-xl transition-all">
              Free Demo
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-mesh-hero pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-bko-blue/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-bko-blue/10 border border-bko-blue/20 rounded-full px-4 py-1.5 text-xs font-medium text-bko-cyan mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-bko-cyan animate-pulse" />
            Voice Commerce for Bharat · Powered by Vapi + GPT-4o
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-display font-extrabold text-5xl md:text-7xl leading-tight text-white mb-4">
            बोलो, हम order
            <br />
            <span className="bg-gradient-to-r from-bko-blue via-bko-cyan to-bko-green bg-clip-text text-transparent">
              करेंगे
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-bko-muted text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Just say it. We&#39;ll handle the rest. Voice-first ordering for elderly users across India — Hindi, Kannada, Tamil, Telugu, and more.
          </motion.p>

          {/* Waveform visual */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 max-w-xs mx-auto mb-10">
            <Waveform />
            <p className="text-xs text-bko-muted mt-3 font-mono">"Ek chicken biryani aur do roti mangwa do…"</p>
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/demo"
              className="flex items-center gap-2 bg-bko-blue hover:bg-bko-blue/90 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all hover:scale-105 active:scale-95">
              <Phone size={16} />
              Start Free Demo
            </Link>
            <Link href="/dashboard"
              className="flex items-center gap-2 glass-elevated border border-white/10 text-bko-text font-medium px-7 py-3.5 rounded-2xl hover:border-white/20 transition-all">
              Operator Dashboard
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Social proof row */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-xs text-bko-muted mt-8">
            Built for the 2026 AI Hackathon · Open-source · Multi-tenant SaaS
          </motion.p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl text-white mb-3">How it works</h2>
          <p className="text-bko-muted">Three steps. Thirty seconds. Done.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-12 left-[33%] right-[33%] h-px bg-gradient-to-r from-bko-blue/40 via-bko-cyan/40 to-bko-green/40" />

          {STEPS.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="glass rounded-2xl p-6 text-center relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <Icon size={24} className="text-white" />
              </div>
              <div className="absolute top-4 right-4 font-display text-4xl font-bold text-white/5">0{i + 1}</div>
              <h3 className="font-display font-semibold text-lg text-white mb-2">{title}</h3>
              <p className="text-sm text-bko-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Platforms ── */}
      <section id="platforms" className="py-16 bg-bko-surface/40">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-3">Supported Platforms</h2>
          <p className="text-bko-muted mb-10 text-sm">Ordering via mock adapters today. Real integrations coming soon.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLATFORMS.map(({ name, bg, border }) => (
              <motion.div key={name}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                whileHover={{ scale: 1.04 }}
                className={`glass rounded-2xl p-6 bg-gradient-to-b ${bg} border ${border} flex flex-col items-center gap-3 cursor-default`}>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <p className="font-display font-semibold text-white text-sm">{name}</p>
                <span className="text-xs text-bko-muted font-mono">Mock mode</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl text-white mb-3">Real Stories</h2>
          <p className="text-bko-muted">From the people we built this for.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, age, city, review, lang }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="glass rounded-2xl p-6 flex flex-col gap-4">
              {/* Stars */}
              <div className="flex gap-0.5">{Array(5).fill(0).map((_, j) => <Star key={j} size={12} className="fill-bko-amber text-bko-amber" />)}</div>
              
              <p className="text-sm text-bko-muted leading-relaxed italic">"{review}"</p>
              
              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/5">
                {/* Initials avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bko-blue to-bko-cyan flex items-center justify-center text-white text-xs font-bold">
                  {name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-bko-muted">Age {age} · {city}</p>
                </div>
                <span className="ml-auto text-xs bg-bko-blue/10 text-bko-cyan px-2 py-0.5 rounded-full">{lang}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-bko-blue to-bko-cyan flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">BolKeOrder</span>
          </div>
          
          {/* Tech badges */}
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {["Next.js 14", "FastAPI", "GraphQL", "Qdrant", "Vapi.ai", "GPT-4o"].map(tech => (
              <span key={tech} className="text-xs font-mono bg-bko-elevated border border-white/5 text-bko-muted px-2.5 py-1 rounded-full">{tech}</span>
            ))}
            
          </div>

          <div className="flex items-center gap-4 text-bko-muted text-sm">
            <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors"><Code2 size={14} /> GitHub</a>
            <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors"><Mail size={14} /> Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
