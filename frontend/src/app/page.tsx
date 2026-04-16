"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Phone, Brain, CheckCircle2, ArrowRight,
  Star, Mic, Code2, Mail, Sparkles,
} from "lucide-react";

/* ═══════════════════════════
   SUB-COMPONENTS
═══════════════════════════ */

/** Waveform — muted heritage palette */
function Waveform() {
  const bars = [
    "#9B2E0B", "#C9A84C", "#4A7C59", "#1A7A6E",
    "#3D3B8E", "rgba(201,168,76,0.2)", "#9B2E0B",
    "#C9A84C", "#4A7C59", "#1A7A6E", "#3D3B8E", "#9B2E0B",
  ];
  return (
    <div className="flex items-end justify-center gap-1.5 h-14">
      {bars.map((bg, i) => (
        <div
          key={i}
          className="wave-bar w-1.5"
          style={{
            animationDelay: `${i * 0.1}s`,
            height: `${18 + Math.sin((i / 11) * Math.PI) * 36}px`,
            background: bg,
            animation: "wave 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

/** Thin gold corner ornaments */
function Corners() {
  return (
    <>
      <span className="ornament" style={{ top: 8, left: 10 }}>✿</span>
      <span className="ornament" style={{ top: 8, right: 10 }}>✿</span>
    </>
  );
}

/** Section gold divider */
function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.45)]" />
      <span style={{ color: "#C9A84C", opacity: 0.7, fontSize: "1rem" }}>✦</span>
      <span style={{ color: "#A87B2A", opacity: 0.55, fontSize: "0.85rem" }}>❁</span>
      <span style={{ color: "#C9A84C", opacity: 0.7, fontSize: "1rem" }}>✦</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.45)]" />
    </div>
  );
}

/* ═══════════════════════════
   DATA
═══════════════════════════ */

const STEPS = [
  {
    icon: Phone,
    num: "01",
    hi: "बोलो",
    en: "User Calls",
    desc: "Elderly user calls a regular phone number — no app, no smartphone, no typing needed.",
    cardCls: "card-step card-step-1",
    accentColor: "#C9A84C",
    borderTop: "2px solid rgba(201,168,76,0.55)",
  },
  {
    icon: Brain,
    num: "02",
    hi: "समझो",
    en: "AI Understands",
    desc: "Vapi + GPT-4o parses vernacular speech, extracts full order intent in Hindi, Kannada, Tamil, Telugu.",
    cardCls: "card-step card-step-2",
    accentColor: "#7EAF88",
    borderTop: "2px solid rgba(126,175,136,0.50)",
  },
  {
    icon: CheckCircle2,
    num: "03",
    hi: "मंगाओ",
    en: "Order Placed",
    desc: "Cart confirmed, platform API called, confirmation SMS sent — all in under 30 seconds.",
    cardCls: "card-step card-step-3",
    accentColor: "#6A92B8",
    borderTop: "2px solid rgba(106,146,184,0.50)",
  },
];

const PLATFORMS = [
  { name: "Swiggy",     emoji: "🛵", tagline: "Food Delivery",    dot: "#D45A1A" },
  { name: "Zomato",     emoji: "🍽️", tagline: "Restaurant Orders", dot: "#B5203A" },
  { name: "Zepto",      emoji: "⚡", tagline: "10-Min Grocery",    dot: "#6B5FCC" },
  { name: "BigBasket",  emoji: "🧺", tagline: "Grocery & More",   dot: "#3D7A4A" },
];

const TESTIMONIALS = [
  {
    name: "Ramaiah K.", age: 72, city: "Bengaluru", lang: "ಕನ್ನಡ", avatar: "ರ",
    review: "Pehle smartphone use karna bahut mushkil tha. Ab bas bolta hoon aur order ho jaata hai!",
  },
  {
    name: "Savitri D.", age: 68, city: "Chennai", lang: "தமிழ்", avatar: "ச",
    review: "Naan phone-il pesivittu biryani vanguvom. Romba easy-a irukku! Vandhanam!",
  },
  {
    name: "Murugan S.", age: 74, city: "Mysuru", lang: "English", avatar: "M",
    review: "My grandson set it up. Now I just call and food comes home. God bless this idea!",
  },
];

const TECH = ["Next.js 14", "FastAPI", "GraphQL", "Qdrant", "Vapi.ai", "GPT-4o"];

/* ═══════════════════════════
   PAGE
═══════════════════════════ */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#130B05", color: "#F2E8D5" }}>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <header className="sticky top-0 z-50 navbar-strip">
        {/* 3px saffron accent at very top */}
        <div style={{ height: 3, background: "linear-gradient(90deg,#9B2E0B,#D45A1A,#C9A84C,#D45A1A,#9B2E0B)" }} />

        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div style={{
              width: 40, height: 40, border: "1px solid rgba(201,168,76,0.5)",
              overflow: "hidden", position: "relative", flexShrink: 0,
            }}>
              <Image src="/images/logo_bko.png" alt="BolKeOrder" fill className="object-cover" />
            </div>
            <div>
              <span style={{ fontFamily: "Rosehot,serif", fontSize: "1.25rem", color: "#C9A84C", display: "block", lineHeight: 1.1 }}>
                BolKeOrder
              </span>
              <span style={{ fontFamily: "Quivert,sans-serif", fontSize: "0.58rem", color: "#8C7A5E", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Voice Commerce · भारत
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7" style={{ fontFamily: "Quivert,sans-serif", fontSize: "0.875rem", color: "#8C7A5E" }}>
            {[["#how","How it Works"],["#platforms","Platforms"],["#stories","Stories"]].map(([h,l]) => (
              <a key={h} href={h} style={{ transition: "color 0.2s" }}
                onMouseOver={e => (e.currentTarget.style.color="#C9A84C")}
                onMouseOut={e  => (e.currentTarget.style.color="#8C7A5E")}
              >{l}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.875rem", color:"#8C7A5E" }}
              className="hidden sm:block hover:text-[#C9A84C] transition-colors">
              Sign in
            </Link>
            <Link href="/demo" className="btn-primary" style={{ fontSize:"0.875rem", padding:"0.5rem 1.1rem" }}>
              <Mic size={14} />Free Demo
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO — deep espresso, orange accent only on "order"
      ══════════════════════════════════════ */}
      <section ref={heroRef} style={{ position:"relative", minHeight:"92vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>

        {/* Mandala/paisley hero image — low opacity, no orange tint */}
        <motion.div style={{ y: heroY, position:"absolute", inset:0, zIndex:0 }}>
          <Image src="/images/hero_banner.png" alt="Indian traditional pattern" fill priority
            style={{ objectFit:"cover", objectPosition:"center", opacity: 0.18 }} />
          {/* Bottom fade to espresso */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(19,11,5,0.45) 0%, rgba(19,11,5,0.5) 60%, #130B05 100%)" }} />
        </motion.div>

        {/* Subtle warm radial — NOT orange, just warmth */}
        <div style={{ position:"absolute", top:"35%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(100,60,20,0.10) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:10, maxWidth:900, margin:"0 auto", padding:"0 1.5rem", textAlign:"center" }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="flex justify-center mb-8">
            <span className="badge-traditional">
              <Sparkles size={11} />
              Voice Commerce for Bharat · Vapi + GPT-4o
              <Sparkles size={11} />
            </span>
          </motion.div>

          {/* Headline — white/ivory, orange ONLY on "order" */}
          <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            style={{ fontFamily:"Rosehot,serif", lineHeight:1.08, marginBottom:"1rem" }}>
            <span style={{ fontSize:"clamp(3.5rem,8vw,6rem)", color:"#F2E8D5", display:"block" }}>बोलो,</span>
            <span style={{ fontSize:"clamp(3.5rem,8vw,6rem)", display:"block" }}>
              <span style={{ color:"#F2E8D5" }}>हम </span>
              {/* ORANGE is only here */}
              <span style={{ background:"linear-gradient(135deg,#9B2E0B,#D45A1A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                order
              </span>
            </span>
            <span style={{ fontSize:"clamp(3.5rem,8vw,6rem)", color:"#F2E8D5", display:"block" }}>करेंगे</span>
          </motion.h1>

          {/* Sub-headline — softer, no orange */}
          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            style={{ fontFamily:"Quivert,sans-serif", color:"#8C7A5E", fontSize:"1.05rem", maxWidth:560, margin:"0 auto 2.5rem", lineHeight:1.7 }}>
            Just say it. We&apos;ll handle the rest. Voice-first ordering for every Indian — Hindi, Kannada, Tamil, Telugu, and more.
          </motion.p>

          {/* Waveform card */}
          <motion.div initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.4 }}
            className="matchbox-card" style={{ maxWidth:280, margin:"0 auto 2.5rem", padding:"1.25rem 1.5rem" }}>
            <Corners />
            <Waveform />
            <div className="rule-gold" />
            <p style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.72rem", color:"#8C7A5E", textAlign:"center" }}>
              &ldquo;Ek chicken biryani aur do roti mangwa do…&rdquo;
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/demo" className="btn-primary" style={{ fontSize:"1rem", padding:"0.8rem 2rem" }}>
              <Phone size={16} />Start Free Demo
            </Link>
            <Link href="/dashboard" className="btn-secondary" style={{ fontSize:"1rem", padding:"0.8rem 2rem" }}>
              Operator Dashboard<ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.75 }}
            style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.72rem", color:"#574535", marginTop:"2rem" }}>
            ✦ Built for the 2026 AI Hackathon · Open-source · Multi-tenant SaaS ✦
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS — charcoal/walnut cards, gold borders
      ══════════════════════════════════════ */}
      <section id="how" style={{ padding:"6rem 0", background:"#0E0904", position:"relative" }}>
        {/* Subtle pattern */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"url('/images/bg_pattern.png')", backgroundSize:220, opacity:0.025, pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:10, maxWidth:1024, margin:"0 auto", padding:"0 1.5rem" }}>
          <div style={{ textAlign:"center", marginBottom:"1rem" }}>
            <span className="badge-traditional" style={{ marginBottom:"1rem", display:"inline-flex" }}>कैसे काम करता है</span>
            <h2 style={{ fontFamily:"Rosehot,serif", fontSize:"clamp(2.2rem,5vw,3.2rem)", color:"#F2E8D5", marginTop:"1rem", marginBottom:"0.5rem" }}>
              How It Works
            </h2>
            <p style={{ fontFamily:"Quivert,sans-serif", color:"#8C7A5E" }}>Three steps. Thirty seconds. Delivered.</p>
          </div>
          <GoldDivider />

          <div className="grid md:grid-cols-3 gap-5" style={{ marginTop:"2.5rem" }}>
            {STEPS.map(({ icon: Icon, num, hi, en, desc, cardCls, accentColor, borderTop }, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.12 }} viewport={{ once:true }}
                className={cardCls} style={{ padding:"2rem 1.75rem", textAlign:"center", borderTop, position:"relative" }}>
                <Corners />

                {/* Step number — muted amber, NOT orange */}
                <div style={{ position:"absolute", top:12, right:16, fontFamily:"Rosehot,serif", fontSize:"3.5rem", color:"rgba(168,123,42,0.12)", lineHeight:1, userSelect:"none" }}>{num}</div>

                {/* Icon ring */}
                <div style={{ width:60, height:60, border:`1px solid ${accentColor}40`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem" }}>
                  <Icon size={24} style={{ color: accentColor }} />
                </div>

                <h3 style={{ fontFamily:"Rosehot,serif", fontSize:"2rem", color: accentColor, marginBottom:"0.1rem" }}>{hi}</h3>
                <p style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.65rem", color:"#574535", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"0.85rem" }}>{en}</p>
                <p style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.875rem", color:"#8C7A5E", lineHeight:1.65 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TECHNOLOGY STRIP — deep teal, stats pop in cream
      ══════════════════════════════════════ */}
      <section style={{ background:"#061514", borderTop:"1px solid rgba(26,122,110,0.25)", borderBottom:"1px solid rgba(26,122,110,0.25)", padding:"5rem 0", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"url('/images/bg_pattern.png')", backgroundSize:200, opacity:0.022, pointerEvents:"none" }} />
        {/* Teal glow */}
        <div style={{ position:"absolute", top:"50%", left:"20%", transform:"translate(-50%,-50%)", width:400, height:400, background:"radial-gradient(ellipse, rgba(26,122,110,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:10, maxWidth:1024, margin:"0 auto", padding:"0 1.5rem", display:"flex", flexWrap:"wrap", gap:"3rem", alignItems:"center" }}>

          {/* Illustration */}
          <motion.div initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} style={{ flex:"0 0 auto" }}>
            <div className="matchbox-card" style={{ maxWidth:300, animation:"float 3s ease-in-out infinite", animationDelay:"0.2s" }}>
              <Image src="/images/dadi_illustration.png" alt="Elderly Indian grandmother ordering food" width={300} height={300} style={{ display:"block", width:"100%", height:"auto" }} />
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} style={{ flex:"1 1 300px" }}>
            <span className="badge-traditional" style={{ marginBottom:"1rem", display:"inline-flex" }}>Built for Bharat</span>
            <h2 style={{ fontFamily:"Rosehot,serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", color:"#F2E8D5", margin:"1rem 0 1rem" }}>
              Bridging the digital gap for{" "}
              <span style={{ background:"linear-gradient(135deg,#1A7A6E,#4A7C59)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                every generation
              </span>
            </h2>
            <p style={{ fontFamily:"Quivert,sans-serif", color:"#8C7A5E", lineHeight:1.75, marginBottom:"2rem" }}>
              India has over 138 million senior citizens. Many own a basic phone but struggle with modern apps. BolKeOrder bridges this gap — just one call in their mother tongue, and food comes home.
            </p>

            {/* Stats — cream text, no orange on labels */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
              {[
                { v:"138M+", l:"Senior Citizens" },
                { v:"12+",   l:"Languages" },
                { v:"30s",   l:"To Order" },
              ].map(({ v, l }) => (
                <div key={l} className="card-traditional" style={{ padding:"1rem", textAlign:"center", border:"1px solid rgba(26,122,110,0.30)", borderTop:"2px solid rgba(26,122,110,0.55)" }}>
                  {/* orange ONLY on numeric value */}
                  <div style={{ fontFamily:"Rosehot,serif", fontSize:"1.6rem", color:"#D45A1A", marginBottom:"0.2rem" }}>{v}</div>
                  <div style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.7rem", color:"#8C7A5E", textTransform:"uppercase", letterSpacing:"0.08em" }}>{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PLATFORMS — dark slate, logos clear
      ══════════════════════════════════════ */}
      <section id="platforms" style={{ padding:"6rem 0", background:"#0D0B09", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"url('/images/bg_pattern.png')", backgroundSize:200, opacity:0.022, pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:10, maxWidth:900, margin:"0 auto", padding:"0 1.5rem", textAlign:"center" }}>
          <span className="badge-traditional" style={{ marginBottom:"1rem", display:"inline-flex" }}>Supported Platforms</span>
          <h2 style={{ fontFamily:"Rosehot,serif", fontSize:"clamp(2rem,5vw,3rem)", color:"#F2E8D5", marginTop:"1rem", marginBottom:"0.5rem" }}>
            Your Favourite Apps
          </h2>
          <p style={{ fontFamily:"Quivert,sans-serif", color:"#8C7A5E", marginBottom:"0.75rem", fontSize:"0.875rem" }}>
            Ordering via mock adapters today. Real integrations coming soon.
          </p>
          <GoldDivider />

          {/* Platform grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5" style={{ marginTop:"2.5rem" }}>
            {PLATFORMS.map(({ name, emoji, tagline, dot }, i) => (
              <motion.div key={name}
                initial={{ opacity:0, scale:0.88 }} whileInView={{ opacity:1, scale:1 }} transition={{ delay:i*0.08 }} viewport={{ once:true }}
                whileHover={{ y:-4, boxShadow:"0 10px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.4)" }}
                className="card-platform" style={{ padding:"2rem 1.25rem", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.75rem", cursor:"default", position:"relative" }}>
                <Corners />

                {/* Coloured status dot */}
                <div style={{ width:8, height:8, background: dot, borderRadius:0, boxShadow:`0 0 8px ${dot}60` }} />

                {/* Emoji — clean, no orange wash */}
                <div style={{ fontSize:"2.5rem", lineHeight:1 }}>{emoji}</div>

                <p style={{ fontFamily:"Quivert,sans-serif", fontWeight:700, color:"#D6C9B0", fontSize:"0.875rem" }}>{name}</p>
                <p style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.7rem", color:"#574535" }}>{tagline}</p>
                <span className="platform-tag">Mock Mode</span>
              </motion.div>
            ))}
          </div>

          {/* Delivery illustration */}
          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ marginTop:"2.5rem" }}>
            <div className="matchbox-card" style={{ maxWidth:360, margin:"0 auto", padding:"0.5rem" }}>
              <Image src="/images/swiggy_label.png" alt="Delivery illustration" width={360} height={200}
                style={{ display:"block", width:"100%", height:"auto" }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS — dark chocolate, gold stars
      ══════════════════════════════════════ */}
      <section id="stories" style={{ padding:"6rem 0", background:"#100A08", borderTop:"1px solid rgba(168,123,42,0.18)", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"url('/images/bg_pattern.png')", backgroundSize:200, opacity:0.025, pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:10, maxWidth:1024, margin:"0 auto", padding:"0 1.5rem" }}>
          <div style={{ textAlign:"center", marginBottom:"1rem" }}>
            <span className="badge-traditional" style={{ marginBottom:"1rem", display:"inline-flex" }}>असली कहानियाँ</span>
            <h2 style={{ fontFamily:"Rosehot,serif", fontSize:"clamp(2.2rem,5vw,3.2rem)", color:"#F2E8D5", marginTop:"1rem", marginBottom:"0.5rem" }}>
              Real Stories
            </h2>
            <p style={{ fontFamily:"Quivert,sans-serif", color:"#8C7A5E" }}>From the people we built this for.</p>
          </div>
          <GoldDivider />

          <div className="grid md:grid-cols-3 gap-5" style={{ marginTop:"2.5rem" }}>
            {TESTIMONIALS.map(({ name, age, city, lang, avatar, review }, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.12 }} viewport={{ once:true }}
                className="card-testimonial" style={{ padding:"1.75rem", display:"flex", flexDirection:"column", gap:"1rem", position:"relative" }}>
                <Corners />

                {/* Gold stars */}
                <div style={{ display:"flex", gap:3, justifyContent:"center" }}>
                  {Array(5).fill(0).map((_,j) => (
                    <Star key={j} size={13}
                      style={{ fill:"#C9A84C", color:"#C9A84C", animation:"flicker 2s ease-in-out infinite", animationDelay:`${j*0.2}s` }} />
                  ))}
                </div>

                {/* Review text — off-white for readability, NOT muted */}
                <p style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.875rem", color:"#D6C9B0", lineHeight:1.7, fontStyle:"italic", textAlign:"center", flex:1 }}>
                  &ldquo;{review}&rdquo;
                </p>

                <div className="rule-gold" style={{ margin:"0.25rem 0" }} />

                <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                  {/* Avatar */}
                  <div style={{ width:40, height:40, border:"1px solid rgba(201,168,76,0.35)", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(201,168,76,0.08)", fontFamily:"Rosehot,serif", fontSize:"1.2rem", color:"#C9A84C", flexShrink:0 }}>
                    {avatar}
                  </div>
                  <div>
                    <p style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.875rem", fontWeight:700, color:"#F2E8D5" }}>{name}</p>
                    <p style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.72rem", color:"#574535" }}>Age {age} · {city}</p>
                  </div>
                  <span className="badge-traditional" style={{ marginLeft:"auto", fontSize:"0.6rem", padding:"0.18rem 0.55rem" }}>{lang}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BAND — THE ONLY orange-dominant block
      ══════════════════════════════════════ */}
      <section style={{ padding:"6rem 0", background:"linear-gradient(135deg, #5A1008 0%, #9B2E0B 40%, #D45A1A 100%)", position:"relative", overflow:"hidden" }}>
        {/* Subtle pattern layer */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"url('/images/bg_pattern.png')", backgroundSize:180, opacity:0.06, pointerEvents:"none" }} />
        {/* Warm radial */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:700, height:700, background:"radial-gradient(ellipse, rgba(255,150,50,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />

        {/* Top border */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"rgba(201,168,76,0.4)" }} />
        {/* Bottom border */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"rgba(201,168,76,0.4)" }} />

        <div style={{ position:"relative", zIndex:10, maxWidth:700, margin:"0 auto", padding:"0 1.5rem", textAlign:"center" }}>
          <h2 style={{ fontFamily:"Rosehot,serif", fontSize:"clamp(2.2rem,6vw,3.5rem)", color:"#FAF0DC", marginBottom:"1rem" }}>
            Try it yourself — free
          </h2>
          <p style={{ fontFamily:"Quivert,sans-serif", color:"rgba(242,232,213,0.70)", marginBottom:"2.5rem", fontSize:"1.05rem" }}>
            No credit card. No app download. Just speak.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", justifyContent:"center" }}>
            {/* Inverted button — ivory on orange bg */}
            <Link href="/demo" style={{
              background:"#FAF0DC", color:"#9B2E0B",
              fontFamily:"Quivert,sans-serif", fontWeight:700,
              border:"2px solid rgba(242,232,213,0.35)",
              padding:"0.9rem 2.25rem",
              display:"inline-flex", alignItems:"center", gap:"0.5rem",
              fontSize:"1rem",
              boxShadow:"0 6px 24px rgba(0,0,0,0.35)",
              transition:"all 0.2s ease",
              textDecoration:"none",
            }}>
              <Mic size={18} />Start Free Demo
            </Link>
            <Link href="/dashboard" style={{
              background:"transparent", color:"#FAF0DC",
              fontFamily:"Quivert,sans-serif",
              border:"1px solid rgba(242,232,213,0.45)",
              padding:"0.9rem 2.25rem",
              display:"inline-flex", alignItems:"center", gap:"0.5rem",
              fontSize:"1rem",
              textDecoration:"none",
              transition:"all 0.2s ease",
            }}>
              Operator Dashboard<ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer style={{ background:"#0A0702", borderTop:"1px solid rgba(201,168,76,0.20)", padding:"2.5rem 0 1.5rem" }}>
        <div className="divider-indian" style={{ maxWidth:1024, margin:"0 auto 1.5rem", padding:"0 1.5rem" }} />

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"1.5rem" }}>
          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <div style={{ width:36, height:36, border:"1px solid rgba(201,168,76,0.3)", overflow:"hidden", position:"relative", flexShrink:0 }}>
              <Image src="/images/logo_bko.png" alt="BolKeOrder" fill className="object-cover" />
            </div>
            <div>
              <span style={{ fontFamily:"Rosehot,serif", fontSize:"1.1rem", color:"#C9A84C", display:"block" }}>BolKeOrder</span>
              <span style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.58rem", color:"#574535", letterSpacing:"0.12em", textTransform:"uppercase" }}>Voice Commerce · भारत</span>
            </div>
          </div>

          {/* Tech badges */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", justifyContent:"center" }}>
            {TECH.map(t => (
              <span key={t} style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.7rem", background:"#17100A", border:"1px solid rgba(201,168,76,0.15)", color:"#574535", padding:"0.2rem 0.65rem" }}>{t}</span>
            ))}
          </div>

          {/* Links */}
          <div style={{ display:"flex", gap:"1.5rem", fontFamily:"Quivert,sans-serif", fontSize:"0.875rem", color:"#574535" }}>
            <a href="#" style={{ display:"flex", alignItems:"center", gap:5, transition:"color 0.2s" }}
              onMouseOver={e => (e.currentTarget.style.color="#C9A84C")}
              onMouseOut={e  => (e.currentTarget.style.color="#574535")}>
              <Code2 size={13} />GitHub
            </a>
            <a href="#" style={{ display:"flex", alignItems:"center", gap:5, transition:"color 0.2s" }}
              onMouseOver={e => (e.currentTarget.style.color="#C9A84C")}
              onMouseOut={e  => (e.currentTarget.style.color="#574535")}>
              <Mail size={13} />Contact
            </a>
          </div>
        </div>

        <p style={{ fontFamily:"Quivert,sans-serif", fontSize:"0.68rem", color:"#2E1E0E", textAlign:"center", marginTop:"1.75rem" }}>
          ✦ Made with ❤️ for Bharat · 2026 AI Hackathon ✦
        </p>
      </footer>
    </div>
  );
}
