"use client";

import { useVoiceAssistant, Language as VapiLang } from "@/hooks/useVoiceAssistant";
import { processTranscript, triggerSilenceCheckout, makeInitialState, ConvState, ConvMessage } from "@/lib/conversationEngine";
import { Mic, MicOff, Phone, PhoneOff, Loader2, Volume2, Settings2, Zap, ChevronLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const SILENCE_TIMEOUT_MS = 10_000; // 10 seconds

export default function DemoPage() {
  const {
    mode, status, volumeLevel, transcript,
    toggleMode, start, stop, speak,
    startListening, startAudioFeedback,
    updateStatus, clearTranscript, setLanguageMode,
  } = useVoiceAssistant("free");

  const [convState, setConvState] = useState<ConvState>(makeInitialState("english"));
  const [isMuted, setIsMuted] = useState(false);

  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTranscript = useRef("");
  const processingRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Shorthand
  const cart = convState.cart;
  const messages = convState.messages;
  const phase = convState.phase;

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset when call ends
  useEffect(() => {
    if (status === "inactive" && phase !== "done") {
      setConvState(makeInitialState("english"));
    }
  }, [status]);

  // Process transcript changes
  useEffect(() => {
    if (status !== "connected" || mode !== "free" || processingRef.current) return;
    if (!transcript || transcript === lastTranscript.current) return;
    lastTranscript.current = transcript;

    // Reset silence timer on every new word
    resetSilenceTimer();

    const output = processTranscript(transcript, convState);
    clearTranscript();

    if (output.cartUpdated || output.speak) {
      setConvState(output.newState);
      if (output.speak) {
        processingRef.current = true;
        speak(output.speak, () => {
          processingRef.current = false;
          if (output.newState.phase !== "done") {
            startListening();
            startAudioFeedback();
            resetSilenceTimer();
          } else {
            updateStatus("ordered");
          }
        });
      }
    }
  }, [transcript, status, mode, convState]);

  const resetSilenceTimer = () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (phase === "done" || phase === "idle") return;

    silenceTimer.current = setTimeout(() => {
      if (processingRef.current) return;
      processingRef.current = true;
      const output = triggerSilenceCheckout(convState);
      setConvState(output.newState);
      if (output.speak) {
        speak(output.speak, () => {
          processingRef.current = false;
          if (output.newState.phase !== "done") {
            startListening();
            startAudioFeedback();
          }
        });
      }
    }, SILENCE_TIMEOUT_MS);
  };

  const handleStartCall = () => {
    const freshState = makeInitialState(convState.lang);
    setConvState(freshState);
    lastTranscript.current = "";
    clearTranscript();
    start();
    // Greeting will be spoken by the hook's start() — add it to messages
    setTimeout(() => {
      const greetingText = freshState.lang === "hindi"
        ? "Namaste! BolKeOrder mein aapka swagat hai. Aaj Meghana Foods se kya mangana chahenge?"
        : "Hello! Welcome to BolKeOrder. I'm ordering from Meghana Foods today. What would you like to have?";
      setConvState(prev => ({
        ...prev,
        messages: [{ role: "ai", text: greetingText, ts: Date.now() }],
      }));
    }, 300);
  };

  const handleEndCall = () => {
    stop();
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    processingRef.current = false;
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const taxes = cart.length > 0 ? 45 : 0;
  const disc = convState.couponApplied ? convState.discount : 0;
  const total = subtotal + taxes - disc;
  const isLive = status === "connected" || status === "speaking";

  return (
    <div className="min-h-screen bg-bko-bg text-bko-text font-sans flex flex-col">
      
      {/* Top bar */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-bko-muted hover:text-bko-text text-sm transition-colors">
          <ChevronLeft size={15} /> Back
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-bko-blue to-bko-cyan flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-display font-bold text-white">BolKeOrder Demo</span>
        </div>
        {/* Mode Toggle */}
        <div className="flex bg-bko-elevated rounded-full p-1 border border-white/5">
          {(["vapi", "free"] as const).map(m => (
            <button key={m} onClick={() => toggleMode(m)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${mode === m ? (m === "vapi" ? "bg-bko-blue text-white" : "bg-bko-green text-white") : "text-bko-muted hover:text-bko-text"}`}>
              {m === "vapi" ? "Vapi (Pro)" : "Free Mode"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">

        {/* ── LEFT: BILL ──────────────────────────────────── */}
        <div className="w-full lg:w-80 lg:border-r border-white/5 flex flex-col">
          {/* Bill Header */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bko-blue to-bko-cyan flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm">Meghana Foods</p>
                <p className="text-xs text-bko-muted">Order #88392 · Pending</p>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
            <AnimatePresence>
              {cart.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-bko-muted text-xs text-center italic py-8">
                  {status === "inactive" ? "Tap the mic to start ordering" : "Say a dish name to add it here…"}
                </motion.div>
              ) : (
                cart.map(item => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-start justify-between gap-2 bg-bko-elevated rounded-xl p-3.5 border border-white/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-bko-text truncate">{item.name}</p>
                      {item.notes && <p className="text-xs text-bko-cyan mt-0.5">{item.notes}</p>}
                      <p className="text-xs text-bko-muted mt-0.5">₹{item.price} × {item.qty}</p>
                    </div>
                    <span className="text-sm font-bold text-bko-text shrink-0">₹{item.price * item.qty}</span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Totals */}
          <div className="p-4 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-xs text-bko-muted">
              <span>Subtotal</span><span>₹{subtotal}</span>
            </div>
            {disc > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex justify-between text-xs text-bko-green">
                <span>Coupon (10%)</span><span>−₹{disc}</span>
              </motion.div>
            )}
            <div className="flex justify-between text-xs text-bko-muted">
              <span>Taxes & fees</span><span>₹{taxes}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-white/5">
              <span className="text-bko-text">Total</span>
              <span className="text-bko-cyan">₹{total}</span>
            </div>

            {/* Status banner */}
            <AnimatePresence mode="wait">
              {status === "ordered" || phase === "done" ? (
                <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="mt-3 flex items-center gap-2 bg-bko-green/15 text-bko-green text-xs font-medium px-3 py-2.5 rounded-xl border border-bko-green/25">
                  <CheckCircle2 size={14} />
                  Order Placed!
                </motion.div>
              ) : phase === "confirming" ? (
                <motion.div key="conf" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 text-xs text-bko-amber text-center font-medium">
                  Waiting for confirmation…
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* ── CENTER: CHAT ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Phase indicator strip */}
          {isLive && (
            <div className="flex items-center gap-3 px-5 py-2 border-b border-white/5 bg-bko-surface/60">
              <span className="w-1.5 h-1.5 rounded-full bg-bko-green animate-pulse shrink-0" />
              <p className="text-xs text-bko-muted font-medium">
                {phase === "ordering"    && "Listening — say any dish or 'remove [item]'"}
                {phase === "upselling"   && "AI suggested something — say yes or no"}
                {phase === "confirming"  && "Order summary — say 'yes confirm' or 'no, change it'"}
                {phase === "asking_coupon" && "Say 'yes' for coupon or 'no' to place order"}
                {phase === "greeting"    && "Say your first dish to begin"}
              </p>
              <span className="ml-auto text-xs font-mono text-bko-muted">
                {convState.lang === "hindi" ? "🇮🇳 Hindi" : "🇬🇧 English"} · Say 'Hindi mein bolo' to switch
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-bko-elevated border border-white/10 flex items-center justify-center">
                  <Mic size={28} className="text-bko-muted" />
                </div>
                <div>
                  <p className="text-bko-text font-semibold text-lg">Ready to take your order</p>
                  <p className="text-bko-muted text-sm mt-1">Tap the microphone button below to start a conversation</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                  {["Chicken Biryani", "Butter Naan", "Masala Dosa", "Gulab Jamun", "Filter Coffee"].map(ex => (
                    <span key={ex} className="text-xs bg-bko-elevated border border-white/10 text-bko-muted px-3 py-1.5 rounded-full">
                      Try: "{ex}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] lg:max-w-[65%] ${msg.role === "ai" ? "flex items-start gap-2.5" : ""}`}>
                    {msg.role === "ai" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bko-blue to-bko-cyan flex items-center justify-center shrink-0 mt-0.5">
                        <Volume2 size={13} className="text-white" />
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "ai"
                        ? "bg-bko-surface border border-white/5 text-bko-text rounded-tl-sm"
                        : "bg-bko-blue text-white rounded-tr-sm"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Live transcript (what user is saying right now) */}
            {status === "connected" && transcript && (
              <div className="flex justify-end">
                <div className="max-w-[65%] bg-bko-blue/30 border border-bko-blue/30 text-bko-text/60 italic text-sm rounded-2xl rounded-tr-sm px-4 py-2.5">
                  {transcript}…
                </div>
              </div>
            )}

            {/* Speaking indicator */}
            {status === "speaking" && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bko-blue to-bko-cyan flex items-center justify-center">
                    <Volume2 size={13} className="text-white" />
                  </div>
                  <div className="bg-bko-surface border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-bko-cyan animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ── Bottom mic control ── */}
          <div className="border-t border-white/5 p-5">
            <div className="flex items-center justify-center gap-4">
              {/* Volume visualizer bar */}
              {isLive && (
                <div className="flex items-end gap-0.5 h-8 w-16">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex-1 rounded-full bg-bko-cyan/60 transition-all duration-75"
                      style={{ height: `${Math.max(15, (volumeLevel * 100 + Math.sin(i) * 20))}%` }} />
                  ))}
                </div>
              )}

              {/* Main mic button */}
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                onClick={isLive || status === "connecting" ? handleEndCall : handleStartCall}
                disabled={phase === "done" && status !== "ordered"}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-400 ${
                  status === "inactive" || status === "ordered"
                    ? "bg-bko-blue hover:bg-bko-blue/90 text-white"
                    : status === "connecting"
                    ? "bg-bko-blue/50 border border-bko-blue animate-pulse"
                    : status === "speaking"
                    ? "bg-bko-cyan/80 text-white"
                    : "bg-bko-red/90 hover:bg-bko-red text-white"
                }`}
              >
                {status === "connecting" ? <Loader2 className="animate-spin" size={24} />
                  : status === "speaking" ? <Volume2 size={24} />
                  : isLive ? <PhoneOff size={24} />
                  : <Mic size={24} />}
              </motion.button>

              {/* Mute button (when active) */}
              {isLive && (
                <button
                  onClick={() => setIsMuted(m => !m)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                    isMuted ? "bg-bko-red/20 border-bko-red/40 text-bko-red" : "bg-bko-elevated border-white/10 text-bko-muted hover:text-bko-text"
                  }`}
                >
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
            </div>

            <p className="text-center text-xs text-bko-muted mt-3">
              {status === "inactive" || status === "ordered"
                ? status === "ordered" ? "Order placed! Tap to start a new order." : "Tap to start"
                : status === "speaking" ? "AI is speaking…"
                : status === "connecting" ? "Starting…"
                : `Listening · Phase: ${phase}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
