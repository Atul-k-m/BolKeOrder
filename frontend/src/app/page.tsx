"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Phone,
  Brain,
  CheckCircle2,
  ArrowRight,
  Star,
  Mic,
  Code2,
  Mail,
  Sparkles,
} from "lucide-react";

// ── Animated Waveform (Rangoli-style colours) ──────────────
function Waveform() {
  const colours = [
    "linear-gradient(to top, #C0392B, #E8631A)",
    "linear-gradient(to top, #E8631A, #F5A623)",
    "linear-gradient(to top, #D4AF37, #F5A623)",
    "linear-gradient(to top, #4A7C59, #1A7A6E)",
    "linear-gradient(to top, #1A7A6E, #3D3B8E)",
    "rgba(212,175,55,0.2)",
  ];
  return (
    <div className="flex items-end justify-center gap-1.5 h-16">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="wave-bar w-2 rounded-sm animate-wave"
          style={{
            animationDelay: `${i * 0.1}s`,
            height: `${20 + Math.sin((i / 11) * Math.PI) * 40}px`,
            background: colours[i % colours.length],
          }}
        />
      ))}
    </div>
  );
}

// ── Corner Flower ornament ─────────────────────────────────
function CornerFlower({ className = "" }: { className?: string }) {
  return (
    <span
      className={`absolute text-bko-gold opacity-60 select-none pointer-events-none ${className}`}
      style={{ fontSize: "1.4rem", lineHeight: 1 }}
    >
      ✿
    </span>
  );
}

// ── Traditional section divider ────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-4 my-2 px-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-bko-gold/50" />
      <span className="text-bko-gold text-xl opacity-80">✦</span>
      <span className="text-bko-saffron text-lg opacity-60">❁</span>
      <span className="text-bko-gold text-xl opacity-80">✦</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-bko-gold/50" />
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────
const PLATFORMS = [
  {
    name: "Swiggy",
    emoji: "🛵",
    tagline: "Food Delivery",
    color: "#E8631A",
    border: "border-bko-saffron/40",
    glow: "shadow-saffron",
  },
  {
    name: "Zomato",
    emoji: "🍽️",
    tagline: "Restaurant Orders",
    color: "#C0392B",
    border: "border-bko-crimson/40",
    glow: "shadow-crimson",
  },
  {
    name: "Zepto",
    emoji: "⚡",
    tagline: "10-Min Grocery",
    color: "#3D3B8E",
    border: "border-bko-indigo/40",
    glow: "shadow-gold",
  },
  {
    name: "BigBasket",
    emoji: "🧺",
    tagline: "Grocery & More",
    color: "#4A7C59",
    border: "border-bko-leaf/40",
    glow: "shadow-gold",
  },
];

const TESTIMONIALS = [
  {
    name: "Ramaiah K.",
    age: 72,
    city: "Bengaluru",
    lang: "ಕನ್ನಡ",
    avatar: "ರ",
    review:
      "Pehle smartphone use karna bahut mushkil tha. Ab bas bolta hoon aur order ho jaata hai!",
    color: "from-bko-saffron/20 to-bko-saffron/5",
  },
  {
    name: "Savitri D.",
    age: 68,
    city: "Chennai",
    lang: "தமிழ்",
    avatar: "ச",
    review:
      "Naan phone-il pesivittu biryani vanguvom. Romba easy-a irukku! Vandhanam!",
    color: "from-bko-crimson/20 to-bko-crimson/5",
  },
  {
    name: "Murugan S.",
    age: 74,
    city: "Mysuru",
    lang: "English",
    avatar: "M",
    review:
      "My grandson set it up. Now I just call and food comes home. God bless this idea!",
    color: "from-bko-peacock/20 to-bko-peacock/5",
  },
];

const STEPS = [
  {
    icon: Phone,
    step: "01",
    title: "बोलो",
    subtitle: "User Calls",
    desc: "Elderly user calls a regular phone number — no app, no smartphone, no typing needed.",
    accent: "text-bko-saffron",
    border: "border-bko-saffron/40",
    bg: "from-bko-saffron/15 to-transparent",
  },
  {
    icon: Brain,
    step: "02",
    title: "समझो",
    subtitle: "AI Understands",
    desc: "Vapi + GPT-4o parses vernacular speech, extracts full order intent in Hindi, Kannada, Tamil, Telugu.",
    accent: "text-bko-turmeric",
    border: "border-bko-turmeric/40",
    bg: "from-bko-turmeric/15 to-transparent",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "मंगाओ",
    subtitle: "Order Placed",
    desc: "Cart confirmed, platform API called, confirmation SMS sent — all in under 30 seconds.",
    accent: "text-bko-peacock",
    border: "border-bko-peacock/40",
    bg: "from-bko-peacock/15 to-transparent",
  },
];

const TECH = ["Next.js 14", "FastAPI", "GraphQL", "Qdrant", "Vapi.ai", "GPT-4o"];

// ── Main Component ─────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <div className="min-h-screen bg-bko-bg text-bko-text overflow-x-hidden">

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <header className="sticky top-0 z-50 navbar-strip">
        {/* Top accent strip */}
        <div className="h-1 w-full bg-festival-gradient" />

        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-sm overflow-hidden border border-bko-gold/40 shadow-gold">
              <Image
                src="/images/logo_bko.png"
                alt="BolKeOrder Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span
                className="font-rosehot text-xl text-bko-gold block leading-tight"
                style={{ fontFamily: "Rosehot, serif" }}
              >
                BolKeOrder
              </span>
              <span className="text-[0.6rem] text-bko-muted tracking-widest uppercase">
                Voice Commerce · भारत
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7 font-quivert text-sm text-bko-muted">
            {[
              { href: "#how", label: "How it Works" },
              { href: "#platforms", label: "Platforms" },
              { href: "#stories", label: "Stories" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="relative hover:text-bko-turmeric transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-px after:bg-bko-gold after:transition-all"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-bko-muted hover:text-bko-turmeric transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link href="/demo" className="btn-primary text-sm py-2 px-5">
              <Mic size={14} />
              Open App Container
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
      >
        {/* Full-bleed hero image */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="/images/hero_banner.png"
            alt="Indian traditional decorative banner"
            fill
            priority
            className="object-cover object-center opacity-25"
          />
          {/* Gradient overlay to keep text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-bko-bg/70 via-bko-bg/60 to-bko-bg" />
        </motion.div>

        {/* Decorative radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bko-saffron/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-bko-crimson/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <span className="badge-traditional">
              <Sparkles size={12} className="text-bko-turmeric" />
              Voice Commerce for Bharat · Powered by Vapi + GPT-4o
              <Sparkles size={12} className="text-bko-turmeric" />
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontFamily: "Rosehot, serif" }}
            className="text-6xl md:text-8xl leading-tight mb-4"
          >
            <span className="text-bko-ivory block">बोलो,</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(135deg, #E8631A 0%, #F5A623 40%, #D4AF37 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              हम order
            </span>
            <span className="text-bko-ivory block">करेंगे</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-bko-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "Quivert, sans-serif" }}
          >
            Just say it. We&apos;ll handle the rest. Voice-first ordering for every
            Indian — Hindi, Kannada, Tamil, Telugu, and more.
          </motion.p>

          {/* Waveform matchbox card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="matchbox-card max-w-xs mx-auto mb-10 p-6"
          >
            <CornerFlower className="top-3 left-3" />
            <CornerFlower className="top-3 right-3" />
            <Waveform />
            <Divider />
            <p
              className="text-xs text-bko-muted mt-1 text-center"
              style={{ fontFamily: "Quivert, sans-serif" }}
            >
              &ldquo;Ek chicken biryani aur do roti mangwa do…&rdquo;
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/demo" className="btn-primary text-base px-8 py-3.5">
              <Phone size={16} />
              Open App Container
            </Link>
            <Link href="/dashboard" className="btn-secondary text-base px-8 py-3.5">
              Operator Dashboard
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-bko-dim mt-8"
            style={{ fontFamily: "Quivert, sans-serif" }}
          >
            ✦ The Universal Voice Platform Container ✦
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section id="how" className="py-24 relative overflow-hidden">

        {/* Background pattern layer */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "url('/images/bg_pattern.png')", backgroundSize: "200px" }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-6">
            <span className="badge-traditional mb-4 inline-flex">कैसे काम करता है</span>
            <h2
              className="text-5xl text-bko-ivory mt-4 mb-3"
              style={{ fontFamily: "Rosehot, serif" }}
            >
              How It Works
            </h2>
            <p className="text-bko-muted" style={{ fontFamily: "Quivert, sans-serif" }}>
              Three steps. Thirty seconds. Delivered.
            </p>
          </div>

          <div className="divider-indian" />

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {STEPS.map(({ icon: Icon, step, title, subtitle, desc, accent, border, bg }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                viewport={{ once: true }}
                className={`matchbox-card p-7 text-center bg-gradient-to-b ${bg}`}
              >
                <CornerFlower className="top-3 left-3" />
                <CornerFlower className="top-3 right-3" />

                {/* Step number */}
                <div
                  className="text-6xl font-bold text-bko-gold/10 absolute top-4 right-6 select-none"
                  style={{ fontFamily: "Rosehot, serif" }}
                >
                  {step}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-sm border ${border} flex items-center justify-center mx-auto mb-4 bg-bko-surface/80`}
                >
                  <Icon size={26} className={accent} />
                </div>

                {/* Hindi + English title */}
                <h3
                  className={`text-3xl ${accent} mb-0.5`}
                  style={{ fontFamily: "Rosehot, serif" }}
                >
                  {title}
                </h3>
                <p className="text-xs text-bko-muted uppercase tracking-widest mb-3">
                  {subtitle}
                </p>
                <p
                  className="text-sm text-bko-muted leading-relaxed"
                  style={{ fontFamily: "Quivert, sans-serif" }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DADI ILLUSTRATION FEATURE STRIP
      ══════════════════════════════════════ */}
      <section className="py-16 bg-bko-surface/30 border-y border-bko-gold/15 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="matchbox-card p-3 max-w-[320px] w-full animate-float">
              <Image
                src="/images/dadi_illustration.png"
                alt="Elderly Indian grandmother ordering food by phone"
                width={320}
                height={320}
                className="w-full h-auto rounded-sm"
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <span className="badge-traditional mb-4 inline-flex">Built for Bharat</span>
            <h2
              className="text-4xl text-bko-ivory mt-4 mb-4"
              style={{ fontFamily: "Rosehot, serif" }}
            >
              Technology that cares for
              <span className="text-festival block"> every generation</span>
            </h2>
            <p
              className="text-bko-muted leading-relaxed mb-6"
              style={{ fontFamily: "Quivert, sans-serif" }}
            >
              India has over 138 million senior citizens. Many own a basic phone but
              struggle with modern apps. BolKeOrder bridges this gap — just one call
              in their mother tongue, and food comes home.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { value: "138M+", label: "Senior Citizens" },
                { value: "12+", label: "Languages" },
                { value: "30s", label: "To Order" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center card-traditional p-4">
                  <div
                    className="text-2xl text-bko-gold mb-1"
                    style={{ fontFamily: "Rosehot, serif" }}
                  >
                    {value}
                  </div>
                  <div className="text-xs text-bko-muted" style={{ fontFamily: "Quivert, sans-serif" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PLATFORMS
      ══════════════════════════════════════ */}
      <section id="platforms" className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: "url('/images/bg_pattern.png')", backgroundSize: "200px" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="badge-traditional mb-4 inline-flex">Supported Platforms</span>
          <h2
            className="text-5xl text-bko-ivory mt-4 mb-3"
            style={{ fontFamily: "Rosehot, serif" }}
          >
            Your Favourite Apps
          </h2>
          <p
            className="text-bko-muted mb-4 text-sm"
            style={{ fontFamily: "Quivert, sans-serif" }}
          >
            Ordering via mock adapters today. Real integrations coming very soon.
          </p>

          <div className="divider-indian" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {PLATFORMS.map(({ name, emoji, tagline, color, border }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -4 }}
                className={`matchbox-card p-6 flex flex-col items-center gap-3 cursor-default relative`}
              >
                <CornerFlower className="top-2 left-2" style={{ fontSize: "0.9rem" }} />
                <CornerFlower className="top-2 right-2" style={{ fontSize: "0.9rem" }} />

                <div
                  className="text-4xl"
                  style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}
                >
                  {emoji}
                </div>
                <p
                  className="font-bold text-bko-ivory text-sm"
                  style={{ fontFamily: "Quivert, sans-serif", color }}
                >
                  {name}
                </p>
                <p className="text-xs text-bko-muted">{tagline}</p>
                <span className="platform-tag">Mock Mode</span>
              </motion.div>
            ))}
          </div>

          {/* Swiggy label art strip */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 matchbox-card p-4 max-w-sm mx-auto overflow-hidden"
          >
            <Image
              src="/images/swiggy_label.png"
              alt="Traditional delivery illustration"
              width={360}
              height={200}
              className="w-full h-auto rounded-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section
        id="stories"
        className="py-24 bg-bko-surface/30 border-y border-bko-gold/15 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "url('/images/bg_pattern.png')", backgroundSize: "200px" }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-6">
            <span className="badge-traditional mb-4 inline-flex">असली कहानियाँ</span>
            <h2
              className="text-5xl text-bko-ivory mt-4 mb-3"
              style={{ fontFamily: "Rosehot, serif" }}
            >
              Real Stories
            </h2>
            <p className="text-bko-muted" style={{ fontFamily: "Quivert, sans-serif" }}>
              From the people we built this for.
            </p>
          </div>

          <div className="divider-indian" />

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {TESTIMONIALS.map(({ name, age, city, lang, avatar, review, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                viewport={{ once: true }}
                className={`matchbox-card p-6 flex flex-col gap-4 bg-gradient-to-b ${color}`}
              >
                <CornerFlower className="top-3 left-3" />
                <CornerFlower className="top-3 right-3" />

                {/* Stars */}
                <div className="flex gap-0.5 justify-center">
                  {Array(5)
                    .fill(0)
                    .map((_, j) => (
                      <Star
                        key={j}
                        size={13}
                        className="fill-bko-gold text-bko-gold animate-flicker"
                        style={{ animationDelay: `${j * 0.2}s` }}
                      />
                    ))}
                </div>

                <p
                  className="text-sm text-bko-muted leading-relaxed italic text-center flex-1"
                  style={{ fontFamily: "Quivert, sans-serif" }}
                >
                  &ldquo;{review}&rdquo;
                </p>

                <div className="rule-gold" style={{ margin: "0.5rem 0" }} />

                <div className="flex items-center gap-3">
                  {/* Devanagari avatar */}
                  <div
                    className="w-10 h-10 rounded-sm bg-bko-saffron/20 border border-bko-gold/30 flex items-center justify-center text-bko-gold font-bold text-lg flex-shrink-0"
                    style={{ fontFamily: "Rosehot, serif" }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold text-bko-ivory"
                      style={{ fontFamily: "Quivert, sans-serif" }}
                    >
                      {name}
                    </p>
                    <p
                      className="text-xs text-bko-muted"
                      style={{ fontFamily: "Quivert, sans-serif" }}
                    >
                      Age {age} · {city}
                    </p>
                  </div>
                  <span className="ml-auto badge-traditional text-[0.6rem] py-0.5 px-2">
                    {lang}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BAND
      ══════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        {/* Saffron gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-r from-bko-crimson/10 via-bko-saffron/10 to-bko-turmeric/10" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url('/images/bg_pattern.png')", backgroundSize: "180px" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2
            className="text-5xl text-bko-ivory mb-4"
            style={{ fontFamily: "Rosehot, serif" }}
          >
            Try it yourself{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#E8631A,#D4AF37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              — free
            </span>
          </h2>
          <p
            className="text-bko-muted mb-8"
            style={{ fontFamily: "Quivert, sans-serif" }}
          >
            No credit card. No app download. Just speak.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn-primary px-10 py-4 text-base">
              <Mic size={18} />
              Open App Container
            </Link>
            <Link href="/dashboard" className="btn-secondary px-10 py-4 text-base">
              Operator Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="border-t border-bko-gold/20 bg-bko-surface/60 py-10">
        {/* Top decorative strip */}
        <div className="divider-indian max-w-5xl mx-auto px-6" />

        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-sm overflow-hidden border border-bko-gold/30">
              <Image
                src="/images/logo_bko.png"
                alt="BolKeOrder"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span
                className="font-bold text-bko-gold block text-lg leading-tight"
                style={{ fontFamily: "Rosehot, serif" }}
              >
                BolKeOrder
              </span>
              <span className="text-[0.6rem] text-bko-muted tracking-widest uppercase">
                Voice Commerce · भारत
              </span>
            </div>
          </div>

          {/* Tech badges */}
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {TECH.map((tech) => (
              <span
                key={tech}
                className="text-xs bg-bko-elevated border border-bko-gold/15 text-bko-muted px-2.5 py-1 rounded-sm"
                style={{ fontFamily: "Quivert, sans-serif" }}
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-bko-muted text-sm">
            <a
              href="#"
              className="flex items-center gap-1.5 hover:text-bko-turmeric transition-colors"
              style={{ fontFamily: "Quivert, sans-serif" }}
            >
              <Code2 size={14} /> GitHub
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 hover:text-bko-turmeric transition-colors"
              style={{ fontFamily: "Quivert, sans-serif" }}
            >
              <Mail size={14} /> Contact
            </a>
          </div>
        </div>

        <p
          className="text-center text-xs text-bko-dim mt-6"
          style={{ fontFamily: "Quivert, sans-serif" }}
        >
          ✦ Made with ❤️ for Bharat · 2026 AI Hackathon ✦
        </p>
      </footer>
    </div>
  );
}
