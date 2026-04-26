"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, ArrowRight, Code2, Mail, Moon, Sun } from "lucide-react";

// ── CSS-only section divider (diamond ornament on 1px line) ──────────────────
function SectionDivider() {
  return <div className="section-divider" />;
}

// ── Hero waveform (CSS-animated bars) ────────────────────────────────────────
function Waveform() {
  return (
    <div className="waveform">
      {[8, 14, 20, 16, 12, 20, 14, 8].map((h, i) => (
        <div key={i} className="waveform-bar" style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}

// ── Inline SVG Step Icons — geometric, no images ─────────────────────────────

/** बोलो — rotary phone circle with dial holes */
function RotaryPhoneIcon() {
  const dialAngles = [0, 60, 120, 180, 240, 300];
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="12.5" stroke="#C1440E" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="5"    stroke="#C1440E" strokeWidth="1.5" />
      {dialAngles.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={16 + 8.5 * Math.cos(rad)}
            cy={16 + 8.5 * Math.sin(rad)}
            r="1.1"
            fill="#C1440E"
          />
        );
      })}
      {/* handset ear + mouth */}
      <path d="M11 10 C9.5 12 9.5 14.5 11 16" stroke="#C1440E" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M21 10 C22.5 12 22.5 14.5 21 16" stroke="#C1440E" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** समझो — sound-wave vertical bars */
function SoundWaveIcon() {
  const bars: [number, number, number][] = [
    [5,  9, 23],
    [9,  7, 25],
    [13, 5, 27],
    [17, 5, 27],
    [21, 7, 25],
    [25, 9, 23],
  ];
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {bars.map(([x, y1, y2], i) => (
        <line
          key={i}
          x1={x} y1={y1} x2={x} y2={y2}
          stroke="#C1440E"
          strokeWidth={i === 2 || i === 3 ? "2.5" : "2"}
          strokeLinecap="round"
          opacity={i === 0 || i === 5 ? "0.55" : "1"}
        />
      ))}
    </svg>
  );
}

/** मंगाओ — tiffin dabba: two stacked rounded rectangles + handle */
function TiffinIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* handle */}
      <path
        d="M13 9 L13 7 Q16 5 19 7 L19 9"
        stroke="#C1440E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* top box */}
      <rect x="8" y="9"  width="16" height="7" rx="2.5" stroke="#C1440E" strokeWidth="1.5" />
      {/* bottom box */}
      <rect x="8" y="17" width="16" height="7" rx="2.5" stroke="#C1440E" strokeWidth="1.5" />
      {/* separator clip line */}
      <line x1="7" y1="16" x2="25" y2="16" stroke="#C1440E" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    Icon: RotaryPhoneIcon, numeral: "01", hindi: "बोलो", sublabel: "User Calls",
    desc: "Elderly user calls a regular phone number — no app, no smartphone, no typing needed.",
  },
  {
    Icon: SoundWaveIcon, numeral: "02", hindi: "समझो", sublabel: "AI Understands",
    desc: "Vapi + GPT-4o parses vernacular speech, extracts full order intent in Hindi, Kannada, Tamil, Telugu.",
  },
  {
    Icon: TiffinIcon, numeral: "03", hindi: "मंगाओ", sublabel: "Order Placed",
    desc: "Cart confirmed, platform API called, confirmation SMS sent — all in under 30 seconds.",
  },
];

const TESTIMONIALS = [
  {
    initials: "R", name: "Ramaiah K.", age: 72, city: "Bengaluru", lang: "ಕನ್ನಡ",
    review: "Pehle smartphone use karna bahut mushkil tha. Ab bas bolta hoon aur order ho jaata hai!",
  },
  {
    initials: "S", name: "Savitri D.", age: 68, city: "Chennai", lang: "தமிழ்",
    review: "Naan phone-il pesivittu biryani vanguvom. Romba easy-a irukku! Vandhanam!",
  },
  {
    initials: "M", name: "Murugan S.", age: 74, city: "Mysuru", lang: "English",
    review: "My grandson set it up. Now I just call and food comes home. God bless this idea!",
  },
];

const PLATFORMS = [
  { name: "Swiggy",    emoji: "🛵", color: "#E8631A" },
  { name: "Zomato",    emoji: "🍽️", color: "#C0392B" },
  { name: "Zepto",     emoji: "⚡",  color: "#3D3B8E" },
  { name: "BigBasket", emoji: "🧺", color: "#4A7C59" },
  { name: "Dunzo",     emoji: "🚴", color: "#D4841A" },
  { name: "Blinkit",   emoji: "⚡",  color: "#F5A623" },
];

const TECH = ["Next.js 14", "FastAPI", "GraphQL", "Qdrant", "Vapi.ai", "GPT-4o"];

// ── Main component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div style={{ 
      minHeight: "100vh", 
      "--c-bg": isDarkMode ? "#1F0C00" : "#F5EDD8",
      "--c-btn-sec-hover": isDarkMode ? "#C9A84C" : "var(--c-terra)",
      "--c-footer-text": isDarkMode ? "#C9A84C" : "#1F0C00",
      "--c-grid-color1": isDarkMode ? "rgba(201, 168, 76, 0.12)" : "rgba(193, 68, 14, 0.04)",
      "--c-grid-color2": isDarkMode ? "rgba(201, 168, 76, 0.09)" : "rgba(193, 68, 14, 0.03)",
      background: "var(--c-bg)",
      overflowX: "hidden" 
    } as React.CSSProperties}>

      {/* ════════════════
          NAVBAR
      ════════════════ */}
      <header className="bko-nav">
        <div className="bko-nav-inner">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{
              position: "relative", width: "36px", height: "36px",
              borderRadius: "4px", overflow: "hidden",
              border: "1px solid rgba(193,68,14,0.35)", flexShrink: 0,
            }}>
              <Image src="/images/logo_bko.png" alt="BolKeOrder logo" fill style={{ objectFit: "cover" }} />
            </div>
            <div>
              <span className="bko-nav-logo-name">BolKeOrder</span>
              <span className="bko-nav-logo-sub" style={{ color: isDarkMode ? "#C4A882" : "#0F172A" }}>Voice Commerce · भारत</span>
            </div>
          </Link>

          <ul className="bko-nav-links">
            <li><a href="#how" style={{ color: isDarkMode ? "#F5EDD8" : "#1F0C00" }}>How it Works</a></li>
            <li><a href="#platforms" style={{ color: isDarkMode ? "#F5EDD8" : "#1F0C00" }}>Platforms</a></li>
            <li><a href="#stories" style={{ color: isDarkMode ? "#F5EDD8" : "#1F0C00" }}>Stories</a></li>
          </ul>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isDarkMode ? "#F5EDD8" : "#1F0C00",
              }}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link
              href="/dashboard"
              style={{ fontFamily: "var(--ff-body)", fontSize: "0.875rem", color: isDarkMode ? "#F5EDD8" : "#1F0C00", textDecoration: "none" }}
            >
              Sign in
            </Link>
            <Link href="/demo" className="btn-primary" style={{ fontSize: "0.875rem", padding: "9px 20px" }}>
              <Mic size={14} /> Open App
            </Link>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════
          GEMINI CALL 1 — HERO
          Mughal miniature background at 12% opacity
      ════════════════════════════════════════════ */}
      <section className="hero-section">
        <div className="hero-bg">
          <Image
            src="/images/hero_bg_mughal.png"
            alt=""
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center", opacity: 0.12 }}
          />
        </div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="hero-eyebrow" style={{ color: isDarkMode ? "#F5EDD8" : "#1F0C00" }}>🇮🇳  Voice Commerce for Bharat</span>

          <h1 className="hero-headline" >
            बोलो, हम<br />order करेंगे
          </h1>

          <p className="hero-sub" style={{ color: isDarkMode ? "#C4A882" : "#0F172A" }}>
            Just say it. We&apos;ll handle the rest. Voice-first ordering for every
            Indian — Hindi, Kannada, Tamil, Telugu, and more.
          </p>

          <div className="hero-btns">
            <Link href="/demo" className="btn-primary">
              <Mic size={16} /> Try Voice Demo
            </Link>
            <Link href="/dashboard" className="btn-secondary" style={{ color: isDarkMode ? "#D4AF37" : "#1F0C00" }}>
              Operator Dashboard <ArrowRight size={16} />
            </Link>
          </div>

          <div className="hero-social-proof" style={{ color: isDarkMode ? "#C4A882" : "#1F0C00" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Waveform />
              <em>&ldquo;Ek chicken biryani aur do roti mangwa do…&rdquo;</em>
            </span>
            <span>✦ No app needed · Just call</span>
          </div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* ════════════════════
          HOW IT WORKS
      ════════════════════ */}
      <section id="how" className="how-section">
        <div className="section-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="section-heading">How It Works</h2>
            <p className="section-sub">Three steps. Thirty seconds. Delivered.</p>
          </motion.div>

          <div className="steps-grid">
            {STEPS.map(({ Icon, numeral, hindi, sublabel, desc }, i) => (
              <motion.div
                key={numeral}
                className={`step-card ${i % 2 === 0 ? "odd" : "even"}`}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.13, duration: 0.4 }}
                viewport={{ once: true }}
              >
                {/* <div className="step-numeral">{numeral}</div> */}
                <div className="step-icon-wrapper">
                  <div className="step-icon-circle">
                    <Icon />
                  </div>
                </div>
                <p className="step-hindi">{hindi}</p>
                <p className="step-sublabel">{sublabel}</p>
                <p className="step-desc">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════
          GEMINI CALL 2 — DADI SECTION
          Using existing dadi_illustration.png (Madhubani-style art)
          Regenerate when quota resets for full Madhubani version
      ════════════════════════════════════════════════════════════ */}
      <section className="dadi-section">
        <div className="dadi-inner">

          {/* Left — illustration */}
          <motion.div
            className="dadi-illustration-wrap"
            initial={{ opacity: 0, x: -44 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="dadi-illustration-frame">
              <Image
                src="/images/dadi_illustration.png"
                alt="Indian grandmother ordering food by phone — Madhubani folk illustration"
                width={500}
                height={600}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </motion.div>

          {/* Right — text + stats */}
          <motion.div
            className="dadi-text-col"
            initial={{ opacity: 0, x: 44 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="dadi-heading">
              Technology that cares<br />
              <em>for every generation</em>
            </h2>
            <p className="dadi-body" style={{ color: isDarkMode ? "#C4A882" : "#1F0C00" }}>
              India has over 138 million senior citizens. Many own a basic phone but
              struggle with modern apps. BolKeOrder bridges this gap — just one call
              in their mother tongue, and food comes home within minutes.
            </p>

            <div className="stats-row">
              {[
                { value: "138M", label: "Senior Citizens" },
                { value: "12+",  label: "Languages"       },
                { value: "30s",  label: "To Order"        },
              ].map(({ value, label }) => (
                <div key={label} className="stat-block">
                  <span className="stat-value" style={{ color: isDarkMode ? "#C9A84C" : "#1F0C00" }}>{value}</span>
                  <span className="stat-label" style={{ color: isDarkMode ? "#C9A84C" : "#1F0C00" }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════
          GEMINI CALL 3 — PLATFORMS SECTION
          Bazaar bg: using geometric CSS pattern (quota exhausted)
          — regenerate with bazaar_bg.png when quota resets
      ════════════════════════════════════════════════════════════ */}
      <section id="platforms" className="platforms-section">
        <div className="platforms-bg-css" aria-hidden="true" />

        <div className="platforms-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="section-heading">Your Favourite Apps</h2>
            <p className="section-sub" style={{ color: isDarkMode ? "#C4A882" : "#1F0C00" }}>
              Ordering via mock adapters today. Real integrations coming very soon.
            </p>
          </motion.div>

          {/* Center card with folk-art illustration */}
          <motion.div
            className="platforms-card"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Image
              src="/images/swiggy_label.png"
              alt="Traditional Indian delivery illustration"
              width={480}
              height={260}
              style={{ width: "100%", height: "auto", borderRadius: "6px", marginBottom: "16px", display: "block" }}
            />
            <p className="platforms-card-caption">
              One call. Multiple platforms. Best price auto-selected.
            </p>
          </motion.div>

          {/* Platform logo strip — 60% opacity, 40px gap */}
          <motion.div
            className="platform-logos"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {PLATFORMS.map(({ name, emoji, color }) => (
              <div key={name} className="platform-logo-item">
                {/* <span className="emoji">{emoji}</span> */}
                <span style={{ color }}>{name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════
          REAL STORIES
      ════════════════════ */}
      <section id="stories" className="stories-section">
        <div className="section-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="section-heading">Real Stories</h2>
            <p className="section-sub" style={{ color: isDarkMode ? "#C4A882" : "#1F0C00" }}>From the people we built this for.</p>
          </motion.div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map(({ initials, name, age, city, lang, review }, i) => (
              <motion.div
                key={name}
                className={`testimonial-card ${i % 2 === 0 ? "odd" : "even"}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.11, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <span className="testimonial-openquote">&ldquo;</span>
                <p className="testimonial-text">{review}</p>
                <div className="testimonial-attribution">
                  <div className="testimonial-avatar">{initials}</div>
                  <div style={{ flex: 1 }}>
                    <span className="testimonial-name">{name}</span>
                    <span style={{
                      display: "block",
                      fontFamily: "var(--ff-body)",
                      fontSize: "0.75rem",
                      color: "var(--c-muted)",
                    }}>
                      Age {age} · {city}
                    </span>
                  </div>
                  <span className="testimonial-pill" style={{ color: isDarkMode ? "#F5EDD8" : "#1F0C00" }}>{lang}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════
          FOOTER CTA BAND — solid #C1440E
      ════════════════════════════════ */}
      <section className="footer-cta">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="footer-cta-headline">Try it yourself — free</h2>
          <p className="footer-cta-sub">No credit card. No app download. Just speak.</p>
          <div className="footer-cta-btns">
            <Link href="/demo" className="btn-white">
              <Mic size={17} /> Open App
            </Link>
            <Link href="/dashboard" className="btn-ghost-white">
              Operator Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ════════════════
          FOOTER
      ════════════════ */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              position: "relative", width: "32px", height: "32px",
              borderRadius: "3px", overflow: "hidden",
              border: "1px solid rgba(193,68,14,0.30)", flexShrink: 0,
            }}>
              <Image src="/images/logo_bko.png" alt="BolKeOrder" fill style={{ objectFit: "cover" }} />
            </div>
            <div>
              <span className="site-footer-brand">BolKeOrder</span>
              <span className="site-footer-sub">Voice Commerce · भारत</span>
            </div>
          </div>

          {/* Tech badges
          <div className="tech-badges">
            {TECH.map((t) => (
              <span key={t} className="tech-badge">{t}</span>
            ))}
          </div> */}

          {/* Links */}
          <div className="site-footer-links">
            <a href="#"><Code2 size={13} /> GitHub</a>
            <a href="#"><Mail size={13} /> Contact</a>
          </div>
        </div>

        <p className="site-footer-copy">✦ Made with ❤️ for Bharat ✦</p>
      </footer>

    </div>
  );
}
