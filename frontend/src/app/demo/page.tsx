"use client";

import { useVoiceAssistant, VapiTranscriptHandler } from "@/hooks/useVoiceAssistant";
import {
  processTranscript,
  triggerSilenceCheckout,
  makeInitialState,
  ConvState,
  getGreeting,
} from "@/lib/conversationEngine";
import {
  Mic, PhoneOff, Loader2, Volume2, Zap, ChevronLeft,
  CheckCircle2, ShoppingBag, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gql, useLazyQuery } from "@apollo/client";

const COMPARE_PRICES_QUERY = gql`
  query ComparePrices($items: [String!]!) {
    comparePrices(items: $items) {
      itemName
      prices {
        platform { id name }
        price
      }
      bestPlatform
      bestPrice
    }
  }
`;

const SILENCE_MS = 10_000;

// ── Subtle waveform for speaking indicator ─────────────────
function SpeakingDots() {
  return (
    <div className="flex items-end gap-1 h-5">
      {[0, 1, 2, 3].map(i => (
        <motion.div key={i}
          className="w-1 rounded-full bg-[#DC136C]"
          animate={{ height: ["6px", "16px", "6px"] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── Volume bars ────────────────────────────────────────────
function VolumeBars({ level }: { level: number }) {
  return (
    <div className="flex items-end gap-0.5 h-7 w-14">
      {Array.from({ length: 7 }).map((_, i) => {
        const h = Math.max(4, (level * 28 + Math.sin((i / 6) * Math.PI) * 10));
        return (
          <motion.div key={i}
            className="flex-1 rounded-full bg-[#84B082]"
            animate={{ height: h }}
            transition={{ duration: 0.1 }}
          />
        );
      })}
    </div>
  );
}

export default function DemoPage() {
  const [conv, setConv] = useState<ConvState>(makeInitialState("english"));
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);
  const lastFinal = useRef("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const convRef = useRef<ConvState>(conv);

  // Keep convRef current — handlers close over this instead of stale conv
  useEffect(() => { convRef.current = conv; }, [conv]);

  const [fetchPrices, { loading: priceLoading }] = useLazyQuery(COMPARE_PRICES_QUERY);

  // ── Vapi transcript handler — runs conversationEngine on every Vapi utterance
  // This is the key integration: Vapi speaks and transcribes, we update cart
  const handleVapiTranscript = useCallback<VapiTranscriptHandler>(
    (role, text) => {
      if (role !== "user") {
        // Assistant spoke — add to chat as AI message
        setConv(prev => ({
          ...prev,
          messages: [...prev.messages, { role: "ai", text, ts: Date.now() }],
        }));
        return;
      }

      // User spoke — run through conversationEngine to update cart/state
      if (processingRef.current) return;
      if (!text.trim() || text === lastFinal.current) return;
      lastFinal.current = text;

      const out = processTranscript(text, convRef.current);
      setConv(out.newState);

      if (out.newState.phase === "done") {
        updateStatus("ordered");
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleVapiCallEnd = useCallback(() => {
    // Vapi ended — if order not done, treat as hang-up
    if (convRef.current.phase !== "done") {
      setConv(makeInitialState("english"));
    }
  }, []);

  const handleVapiFunctionCall = useCallback<VapiFunctionCallHandler>(
    (name, args) => {
      console.log("[Vapi Tool]", name, args);
      if (name === "complete_order") {
        const parsedItems = (args.items as string[]) || [];
        const newCart = parsedItems.map((itemStr, idx) => {
          const match = itemStr.match(/^(\d+)\s+(.+)$/);
          const qty = match ? parseInt(match[1]) : 1;
          const itemName = match ? match[2] : itemStr;
          return {
            id: `vapi-item-${idx}`,
            name: itemName,
            price: 250, // mock fallback
            category: "food" as const,
            qty
          };
        });

        setConv(prev => ({
          ...prev,
          cart: newCart.length > 0 ? newCart : prev.cart,
          phase: "comparing_prices"
        }));
      }
    },
    []
  );

  const {
    mode, status, volumeLevel,
    interimTranscript, finalTranscript,
    toggleMode, start, stop, speak,
    startListening, startAudioFeedback,
    updateStatus, clearFinalTranscript,
  } = useVoiceAssistant({
    defaultMode: "free",
    onVapiTranscript: handleVapiTranscript,
    onVapiFunctionCall: handleVapiFunctionCall,
    onVapiCallEnd: handleVapiCallEnd,
  });

  const cart = conv.cart;
  const msgs = conv.messages;
  const isLive = status === "connected" || status === "speaking";

  // ── Auto-scroll chat ──────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, interimTranscript]);

  // ── Reset on hang-up (free mode) ──────────────────────────
  useEffect(() => {
    if (status === "inactive" && conv.phase !== "done") {
      setConv(makeInitialState("english"));
    }
  }, [status]);

  // ── Silence timer helpers ─────────────────────────────────
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    const phase = convRef.current.phase;
    if (phase === "done" || phase === "idle") return;

    silenceTimer.current = setTimeout(() => {
      if (processingRef.current) return;
      processingRef.current = true;
      const out = triggerSilenceCheckout(convRef.current);
      setConv(out.newState);
      if (out.speak) {
        speak(out.speak, () => {
          processingRef.current = false;
          if (out.newState.phase !== "done") {
            startListening();
            startAudioFeedback();
          }
        });
      }
    }, SILENCE_MS);
  }, [speak, startListening, startAudioFeedback]);

  // ── Process FINAL transcript (free mode only) ─────────────
  // Vapi mode drives cart via handleVapiTranscript above instead
  useEffect(() => {
    if (mode !== "free") return;
    if (status !== "connected") return;
    if (processingRef.current) return;
    if (!finalTranscript || finalTranscript === lastFinal.current) return;

    lastFinal.current = finalTranscript;
    resetSilenceTimer();

    const out = processTranscript(finalTranscript, convRef.current);
    clearFinalTranscript();

    if (!out.speak && !out.cartUpdated) return;
    setConv(out.newState);

    if (out.speak) {
      processingRef.current = true;
      speak(out.speak, () => {
        processingRef.current = false;
        if (out.newState.phase !== "done") {
          startListening();
          startAudioFeedback();
          resetSilenceTimer();
        } else {
          updateStatus("ordered");
        }
      });
    }
  }, [finalTranscript]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle comparing_prices Phase (GraphQL Side Effect) ───
  useEffect(() => {
    if (conv.phase === "comparing_prices" && !priceLoading) {
      if (!conv.comparisonResult) {
        const items = conv.cart.map((i) => i.name);
        fetchPrices({ variables: { items } }).then(({ data }) => {
          if (data && data.comparePrices) {
            let bestTotal = 0;
            let commonBestPlatform = "Zomato";

            const totalMockCartOriginal = conv.cart.reduce((s, i) => s + i.price * i.qty, 0);

            data.comparePrices.forEach((res: any) => {
              // We'll multiply the best price strictly by quantity from cart just to be accurate
              const cartItem = conv.cart.find(c => c.name === res.itemName);
              const qty = cartItem ? cartItem.qty : 1;
              bestTotal += res.bestPrice * qty;
              commonBestPlatform = res.bestPlatform; // fallback simple logic
            });

            const taxes = 45;
            const discNew = conv.couponApplied ? Math.floor(bestTotal * 0.10) : 0;
            const finalBestTotal = bestTotal + taxes - discNew;
            
            const discOld = conv.couponApplied ? Math.floor(totalMockCartOriginal * 0.10) : 0;
            const finalOldTotal = totalMockCartOriginal + taxes - discOld;

            let speakMsg = "";
            let finalPlatform = "Meghana Foods Direct";
            let actualTotal = finalOldTotal;

            if (finalBestTotal < finalOldTotal) {
              finalPlatform = commonBestPlatform;
              actualTotal = finalBestTotal;
              speakMsg = conv.lang === "hindi"
                ? `Maine check kiya, ${commonBestPlatform} par yeh sirf ₹${finalBestTotal} ka hai, jo direct se sasta hai. Main order ${commonBestPlatform} se place kar raha hoon. Shukriya!`
                : `Good news! Found a better deal on ${commonBestPlatform} for ₹${finalBestTotal}. I've placed your order there instead of the original ₹${finalOldTotal}. Thank you!`;
            } else {
              speakMsg = conv.lang === "hindi"
                ? `Current order hi best price par hai ₹${finalOldTotal}. Order place ho gaya!`
                : `Your current cart is already the lowest price at ₹${finalOldTotal}. Order placed successfully!`;
            }

            setConv((prev) => ({
              ...prev,
              phase: "done",
              comparisonResult: {
                platform: finalPlatform,
                oldTotal: finalOldTotal,
                newTotal: actualTotal,
              },
              messages: [...prev.messages, { role: "ai", text: speakMsg, ts: Date.now() }],
            }));

            if (mode === "vapi") {
              stop(); // End the Vapi call seamlessly
            }

            speak(speakMsg, () => {
              updateStatus("ordered");
            });
          }
        });
      }
    }
  }, [conv.phase, priceLoading, fetchPrices, speak, updateStatus, conv.cart, conv.couponApplied, conv.lang, conv.comparisonResult]);

  // ── Start handler ─────────────────────────────────────────
  const handleStart = useCallback(() => {
    const fresh = makeInitialState("english");
    setConv(fresh);
    convRef.current = fresh;
    lastFinal.current = "";
    clearFinalTranscript();
    processingRef.current = false;

    if (mode === "vapi") {
      // Vapi: assistant handles greeting + voice automatically.
      // We just start the call and let onVapiTranscript handle everything.
      start();
      // Optimistically push greeting into chat once Vapi connects
      // (Vapi will also fire a transcript for it, but this feels snappier)
      const greet = getGreeting("english");
      setConv(prev => ({
        ...prev,
        phase: "ordering",
        messages: [{ role: "ai", text: greet, ts: Date.now() }],
      }));
      return;
    }

    // Free mode — we control greeting + TTS
    updateStatus("connecting");
    const greet =
      "Hello! Welcome to BolKeOrder. I am here to take your order from Meghana Foods. What would you like to have today?";

    const doGreet = () => {
      updateStatus("connected");
      setConv(prev => ({
        ...prev,
        phase: "ordering",
        messages: [{ role: "ai", text: greet, ts: Date.now() }],
      }));
      speak(greet, () => {
        processingRef.current = false;
        startListening();
        startAudioFeedback();
        resetSilenceTimer();
      });
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = doGreet;
    } else {
      doGreet();
    }
  }, [
    mode, start, speak, startListening, startAudioFeedback,
    updateStatus, clearFinalTranscript, resetSilenceTimer,
  ]);

  // ── Stop handler ──────────────────────────────────────────
  const handleStop = useCallback(() => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    processingRef.current = false;
    stop();
  }, [stop]);

  // ── Totals ────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const taxes = cart.length > 0 ? 45 : 0;
  const disc = conv.couponApplied ? conv.discount : 0;
  const total = conv.comparisonResult ? conv.comparisonResult.newTotal : (subtotal + taxes - disc);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#1E2230", fontFamily: "var(--font-poppins), sans-serif" }}>

      {/* ── Top Bar ─────────────────────────────────────── */}
      <header
        style={{ background: "rgba(30,34,48,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        className="sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between"
      >
        <Link href="/" className="flex items-center gap-2 text-[#F7C1BB]/60 hover:text-[#F7C1BB] text-sm transition-colors">
          <ChevronLeft size={15} /> Home
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #DC136C, #885A5A)" }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white text-base tracking-tight">BolKeOrder</span>
          <span
            style={{ background: "rgba(132,176,130,0.15)", border: "1px solid rgba(132,176,130,0.3)", color: "#84B082" }}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
          >Demo</span>
        </div>

        {/* Mode toggle */}
        <div
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          className="flex rounded-xl p-1"
        >
          {(["vapi", "free"] as const).map(m => (
            <button
              key={m}
              onClick={() => toggleMode(m)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={mode === m
                ? { background: m === "vapi" ? "#DC136C" : "#84B082", color: "#fff" }
                : { color: "rgba(247,193,187,0.5)" }}
            >
              {m === "vapi" ? "Vapi Pro" : "Free Mode"}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main Layout ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ════════════════ LEFT: BILL ═══════════════════ */}
        <div className="w-full lg:w-72 flex flex-col"
          style={{ background: "#161925", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Bill Header */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #DC136C22, #DC136C44)", border: "1px solid #DC136C33" }}>
                <ShoppingBag size={15} style={{ color: "#DC136C" }} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Meghana Foods</p>
                <p className="text-[11px]" style={{ color: "rgba(247,193,187,0.45)" }}>
                  Order #88392
                  {mode === "vapi" && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{ background: "rgba(220,19,108,0.2)", color: "#DC136C" }}>
                      VAPI
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
            <AnimatePresence>
              {cart.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                  className="text-center py-10" style={{ color: "#F7C1BB" }}>
                  <ShoppingBag size={28} className="mx-auto mb-3 opacity-30" />
                  <p className="text-xs italic">
                    {isLive ? "Say a dish to add it here…" : "Tap mic to start ordering"}
                  </p>
                </motion.div>
              ) : (
                cart.map(item => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}
                    className="flex items-start gap-3 p-3.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white leading-tight truncate">{item.name}</p>
                      {item.notes && (
                        <p className="text-[10px] mt-0.5" style={{ color: "#84B082" }}>{item.notes}</p>
                      )}
                      <p className="text-[11px] mt-1" style={{ color: "rgba(247,193,187,0.4)" }}>
                        ₹{item.price} × {item.qty}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-white shrink-0">₹{item.price * item.qty}</span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Bill Totals */}
          <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs" style={{ color: "rgba(247,193,187,0.5)" }}>
                <span>Subtotal</span><span>₹{subtotal}</span>
              </div>
              {disc > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex justify-between text-xs" style={{ color: "#84B082" }}>
                  <span>Coupon (10% off)</span><span>−₹{disc}</span>
                </motion.div>
              )}
              <div className="flex justify-between text-xs" style={{ color: "rgba(247,193,187,0.5)" }}>
                <span>Taxes & fees</span><span>₹{taxes}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-sm pt-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-white">Total</span>
              <span style={{ color: "#84B082" }}>₹{total}</span>
            </div>

            <AnimatePresence mode="wait">
              {(status === "ordered" || conv.phase === "done") && (
                <motion.div key="placed" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: "rgba(132,176,130,0.12)", border: "1px solid rgba(132,176,130,0.25)", borderRadius: 12 }}
                  className="mt-3 flex flex-col gap-2 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} style={{ color: "#84B082" }} />
                    <span className="text-xs font-semibold" style={{ color: "#84B082" }}>Order Placed via {conv.comparisonResult?.platform || "Direct"}!</span>
                  </div>
                  {conv.comparisonResult && conv.comparisonResult.newTotal < conv.comparisonResult.oldTotal && (
                    <div className="text-[10px]" style={{ color: "#84B082" }}>
                      AI saved you ₹{conv.comparisonResult.oldTotal - conv.comparisonResult.newTotal} by switching platforms!
                    </div>
                  )}
                </motion.div>
              )}
              {conv.phase === "confirming" && (
                <motion.div key="conf" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ background: "rgba(220,19,108,0.1)", border: "1px solid rgba(220,19,108,0.2)", borderRadius: 12, color: "#F7C1BB" }}
                  className="mt-3 px-3 py-2.5 text-xs text-center">
                  Waiting for your confirmation…
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ════════════════ RIGHT: CHAT ══════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Phase hint strip */}
          <AnimatePresence>
            {isLive && (
              <motion.div key="phase"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                style={{ background: mode === "vapi" ? "rgba(220,19,108,0.1)" : "rgba(220,19,108,0.07)", borderBottom: "1px solid rgba(220,19,108,0.12)" }}
                className="px-6 py-2.5 flex items-center justify-between flex-wrap gap-2"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={12} style={{ color: "#DC136C" }} />
                  <span className="text-xs" style={{ color: "rgba(247,193,187,0.7)" }}>
                    {mode === "vapi" && "Vapi Pro — natural voice AI with real-time transcription"}
                    {mode === "free" && conv.phase === "ordering"    && "Speak naturally — I'll add items as you say them"}
                    {mode === "free" && conv.phase === "upselling"   && "Say yes or no to the suggestion"}
                    {mode === "free" && conv.phase === "confirming"  && "Say 'yes confirm' or 'no, change it'"}
                    {mode === "free" && conv.phase === "asking_coupon" && "Say 'yes' for coupon or 'no' to place order"}
                    {mode === "free" && conv.phase === "comparing_prices" && "AI is comparing prices across platforms..."}
                    {mode === "free" && conv.phase === "greeting"    && "Ready to receive your order"}
                  </span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: "rgba(247,193,187,0.3)" }}>
                  {mode === "free" ? `Say "Hindi mein bolo" to switch language` : "Powered by Vapi AI"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {msgs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center max-w-xs mx-auto">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(220,19,108,0.1)", border: "1px solid rgba(220,19,108,0.2)" }}>
                  <Mic size={24} style={{ color: "#DC136C" }} />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg mb-2">Ready to take your order</p>
                  <p className="text-sm" style={{ color: "rgba(247,193,187,0.5)" }}>
                    {mode === "vapi"
                      ? "Tap the mic to connect to Vapi Pro — a real AI voice assistant that understands natural speech."
                      : "Tap the microphone and tell me what you'd like. I'll add each item as you speak."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Chicken Biryani", "Butter Naan", "Masala Dosa", "Dal Makhani", "Filter Coffee"].map(s => (
                    <span key={s} className="text-xs px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(247,193,187,0.5)" }}>
                      "{s}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {msgs.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="mr-3 shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #DC136C, #885A5A)" }}>
                        <Volume2 size={13} className="text-white" />
                      </div>
                    </div>
                  )}
                  <div className="max-w-[72%]">
                    <div className="px-4 py-3 text-sm leading-relaxed"
                      style={msg.role === "ai" ? {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "4px 18px 18px 18px",
                        color: "#F7C1BB",
                      } : {
                        background: "linear-gradient(135deg, #DC136C, #885A5A)",
                        borderRadius: "18px 4px 18px 18px",
                        color: "#fff",
                      }}>
                      {msg.text}
                    </div>
                    <p className="text-[10px] mt-1 px-1" style={{ color: "rgba(247,193,187,0.25)" }}>
                      {new Date(msg.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Interim transcript bubble */}
            <AnimatePresence>
              {status === "connected" && interimTranscript && (
                <motion.div key="interim"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[72%] px-4 py-3 text-sm italic"
                    style={{ background: "rgba(220,19,108,0.12)", border: "1px solid rgba(220,19,108,0.18)", borderRadius: "18px 4px 18px 18px", color: "rgba(247,193,187,0.6)" }}>
                    {interimTranscript}
                    <span className="inline-block w-0.5 h-3.5 ml-1 rounded-full bg-[#DC136C] align-middle animate-pulse" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI speaking indicator */}
            <AnimatePresence>
              {status === "speaking" && (
                <motion.div key="speaking"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex justify-start items-end gap-3"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #DC136C, #885A5A)" }}>
                    <Volume2 size={13} className="text-white" />
                  </div>
                  <div className="px-4 py-3.5"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px 18px 18px 18px" }}>
                    <SpeakingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={chatEndRef} />
          </div>

          {/* ── Mic Control Bottom Bar ─────────────────── */}
          <div className="px-6 py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#161925" }}>
            <div className="flex items-center justify-center gap-5">
              <AnimatePresence>
                {isLive && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <VolumeBars level={volumeLevel} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={isLive || status === "connecting" ? handleStop : handleStart}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300"
                style={
                  status === "inactive" || status === "ordered"
                    ? { background: "linear-gradient(135deg, #DC136C, #885A5A)", boxShadow: "0 0 32px #DC136C44" }
                  : status === "connecting"
                    ? { background: "rgba(220,19,108,0.3)", border: "2px solid #DC136C" }
                  : status === "speaking"
                    ? { background: "#84B082", boxShadow: "0 0 24px #84B08244" }
                  : { background: "rgba(220,19,108,0.15)", border: "1.5px solid #DC136C44" }
                }
              >
                {status === "connecting" ? <Loader2 className="animate-spin text-white" size={24} />
                  : isLive ? <PhoneOff className="text-white" size={22} />
                  : <Mic className="text-white" size={24} />}
              </motion.button>

              <AnimatePresence>
                {isLive && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    style={{ transform: "scaleX(-1)" }}>
                    <VolumeBars level={volumeLevel} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-xs mt-3 font-medium" style={{ color: "rgba(247,193,187,0.35)" }}>
              {status === "inactive"   && (mode === "vapi" ? "Tap to connect to Vapi Pro" : "Tap to start ordering")}
              {status === "ordered"    && "Order placed! Tap to start again."}
              {status === "connecting" && (mode === "vapi" ? "Connecting to Vapi…" : "Starting…")}
              {status === "speaking"   && (mode === "vapi" ? "Vapi is responding…" : "AI is responding…")}
              {status === "connected"  && conv.phase === "confirming"    && "Say 'yes confirm' or 'no, change it'"}
              {status === "connected"  && conv.phase === "asking_coupon" && "Say yes for coupon, or no to place order"}
              {status === "connected"  && conv.phase === "ordering"      && (
                interimTranscript ? "Speak freely, I'm listening…" : "Listening — say a dish name"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}