// ──────────────────────────────────────────────────────────────
// BolKeOrder — Conversation Engine
// Pure state-machine driven conversation logic.
// Processes each new transcript and returns the next AI action.
// ──────────────────────────────────────────────────────────────

import {
  parseItemFromTranscript,
  detectRemoveIntent,
  detectConfirmation,
  detectDoneOrdering,
  UPSELL_SUGGESTIONS,
  CartItem,
  MenuItem,
  findMenuItemById,
} from "@/data/menu";

export type ConvPhase =
  | "idle"
  | "greeting"       // AI said hello, listening for first item
  | "ordering"       // Active ordering
  | "upselling"      // AI suggested something, waiting for response
  | "summarizing"    // AI reading back the full order (10s silence triggered this)
  | "confirming"     // AI asked "Shall I confirm?" waiting for yes/no
  | "asking_coupon"  // Confirmed, now asking for coupon
  | "comparing_prices" // Querying GraphQL to compare platform prices
  | "finalizing"     // All done
  | "done";

export type Language = "english" | "hindi";

export type ConvMessage = {
  role: "ai" | "user";
  text: string;
  ts: number;
};

export type ConvState = {
  phase: ConvPhase;
  cart: CartItem[];
  lang: Language;
  lastAddedCategory?: string;
  upsellPending?: string[]; // item IDs pending upsell
  couponApplied: boolean;
  discount: number;
  messages: ConvMessage[];
  comparisonResult?: {
    platform: string;
    oldTotal: number;
    newTotal: number;
  };
};

export type ConvOutput = {
  newState: ConvState;
  speak: string | null;    // TTS string for AI to say
  cartUpdated: boolean;
};

// ── Helpers ──────────────────────────────────────────────────

function formatCartSummary(cart: CartItem[], lang: Language): string {
  if (cart.length === 0) return lang === "hindi" ? "Abhi tak kuch nahi choose kiya." : "Your cart is empty.";

  const lines = cart.map(i => `${i.qty > 1 ? i.qty + " × " : ""}${i.name}${i.notes ? ` (${i.notes})` : ""}`);
  const total = calcTotal(cart);
  const taxed = total + 45;

  if (lang === "hindi") {
    return `Aapka order hai: ${lines.join(", ")}. Kul amount ₹${taxed} hoga taxes ke saath. Kya main yeh order place kar doon?`;
  }
  return `Alright! Here is your order: ${lines.join("; ")}. The total comes to ₹${taxed} including taxes. Shall I go ahead and confirm it?`;
}

function calcTotal(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function addMessage(state: ConvState, role: "ai" | "user", text: string): ConvState {
  return {
    ...state,
    messages: [...state.messages, { role, text, ts: Date.now() }],
  };
}

// ── Greeting ─────────────────────────────────────────────────
export function getGreeting(lang: Language): string {
  if (lang === "hindi") {
    return "Namaste! BolKeOrder mein aapka swagat hai. Aaj Meghana Foods se kya mangana chahenge? Main aapki poori help karunga.";
  }
  return "Hello! Welcome to BolKeOrder. I'm ordering from Meghana Foods today. What would you like to have? You can order any dish, and I'll add it right away.";
}

// ── Core Processor ───────────────────────────────────────────
export function processTranscript(
  rawTranscript: string,
  state: ConvState,
): ConvOutput {
  const transcript = rawTranscript.trim();
  if (!transcript) return { newState: state, speak: null, cartUpdated: false };

  const lower = transcript.toLowerCase();
  let s = addMessage(state, "user", transcript);
  let speak: string | null = null;
  let cartUpdated = false;

  // ── Language switch detection ─────────────────────────────
  if (lower.includes("hindi") || lower.includes("hindi mein") || lower.includes("hindi me bolo")) {
    s = { ...s, lang: "hindi" };
    speak = "Theek hai! Ab main Hindi mein bolunga. Toh kya mangwa rahe hain aap?";
    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated };
  }
  if ((lower.includes("english") || lower.includes("english mein")) && s.lang !== "english") {
    s = { ...s, lang: "english" };
    speak = "Sure! Switching back to English. What would you like to add?";
    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated };
  }

  const lang = s.lang;

  // ── Handle phase: upselling ──────────────────────────────
  if (s.phase === "upselling") {
    const conf = detectConfirmation(transcript);
    const doneOrdering = detectDoneOrdering(transcript);

    if (conf === "yes" && s.upsellPending?.length) {
      const item = findMenuItemById(s.upsellPending[0]);
      if (item) {
        const newCart = [...s.cart, { ...item, qty: 1 }];
        s = { ...s, cart: newCart, phase: "ordering", upsellPending: undefined };
        cartUpdated = true;
        speak = lang === "hindi"
          ? `${item.name} add kar diya! ₹${item.price} ka. Aur kuch?`
          : `Added ${item.name} for ₹${item.price}. Anything else you'd like?`;
        s = addMessage(s, "ai", speak);
        return { newState: s, speak, cartUpdated };
      }
    }

    // Any form of "no" or "done" snaps out of upsell and moves to confirm
    if (conf === "no" || doneOrdering) {
      const summary = formatCartSummary(s.cart, lang);
      s = { ...s, phase: "confirming", upsellPending: undefined };
      s = addMessage(s, "ai", summary);
      return { newState: s, speak: summary, cartUpdated: false };
    }

    // They might be adding a new item — fall through to item parsing below
    s = { ...s, phase: "ordering", upsellPending: undefined };
  }

  // ── Handle phase: summarizing / confirming ───────────────
  if (s.phase === "summarizing" || s.phase === "confirming") {
    const conf = detectConfirmation(transcript);
    if (conf === "yes") {
      s = { ...s, phase: "asking_coupon" };
      speak = lang === "hindi"
        ? "Badiya! Kya aapke paas koi coupon code hai? Ya seedha order place karoon?"
        : "Perfect! Do you have a coupon code to apply, or should I place the order now?";
      s = addMessage(s, "ai", speak);
      return { newState: s, speak, cartUpdated };
    }
    if (conf === "no") {
      s = { ...s, phase: "ordering" };
      speak = lang === "hindi"
        ? "Okay, kya badalna chahte hain? Koi item remove karoon ya kuch aur add karoon?"
        : "Of course! What would you like to change? You can add more items, remove something, or adjust quantities.";
      s = addMessage(s, "ai", speak);
      return { newState: s, speak, cartUpdated };
    }
    // If they kept talking — try to parse an item (they might be adding to order)
  }

  // ── Handle phase: asking_coupon ──────────────────────────
  if (s.phase === "asking_coupon") {
    const conf = detectConfirmation(transcript);
    const hasCoupon = lower.includes("apply") || lower.includes("yes") || lower.includes("haan");
    const noCoupon = lower.includes("no") || lower.includes("nahi") || lower.includes("skip") || lower.includes("directly");

    if (hasCoupon || conf === "yes") {
      const sub = calcTotal(s.cart);
      const disc = Math.floor(sub * 0.10);
      const total = sub + 45 - disc;
      s = { ...s, phase: "comparing_prices", couponApplied: true, discount: disc };
      speak = lang === "hindi"
        ? `Coupon apply ho gaya! Aapne ₹${disc} bachaye. Ab main best price compare kar raha hoon.`
        : `Coupon applied! You saved ₹${disc}. Give me a moment to find the best price across platforms...`;
      s = addMessage(s, "ai", speak);
      return { newState: { ...s, phase: "comparing_prices" }, speak, cartUpdated: false };
    }
    if (noCoupon || conf === "no") {
      const total = calcTotal(s.cart) + 45;
      s = { ...s, phase: "comparing_prices", couponApplied: false };
      speak = lang === "hindi"
        ? `Theek hai. Ab main sab platforms par check karta hoon.`
        : `Great! Let me compare prices to give you the best deal...`;
      s = addMessage(s, "ai", speak);
      return { newState: { ...s, phase: "comparing_prices" }, speak, cartUpdated: false };
    }
    // Ambiguous response, re-ask
    speak = lang === "hindi"
      ? "Haan ya na? Coupon apply karoon?"
      : "Just say yes if you have a coupon, or no to place the order now.";
    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated };
  }

  // ── Handle remove intent ─────────────────────────────────
  const removeId = detectRemoveIntent(transcript);
  if (removeId) {
    const removed = s.cart.find(i => i.id === removeId);
    const newCart = s.cart.filter(i => i.id !== removeId);
    cartUpdated = newCart.length !== s.cart.length;
    s = { ...s, cart: newCart };
    if (removed && cartUpdated) {
      speak = lang === "hindi"
        ? `${removed.name} remove kar diya. Aur kuch badalna hai?`
        : `Removed ${removed.name}. Is there anything else you'd like to change?`;
    } else {
      speak = lang === "hindi" ? "Woh item cart mein nahi tha." : "That item wasn't in your cart.";
    }
    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated };
  }

  // ── Handle item detection (ordering phase) ───────────────
  // First check if user is signalling they are done ordering
  if (s.phase === "ordering") {
    const doneSignal = detectDoneOrdering(transcript);
    if (doneSignal && s.cart.length > 0) {
      const summary = formatCartSummary(s.cart, lang);
      s = { ...s, phase: "confirming" };
      s = addMessage(s, "ai", summary);
      return { newState: s, speak: summary, cartUpdated: false };
    }
    if (doneSignal && s.cart.length === 0) {
      speak = lang === "hindi"
        ? "Aapne abhi kuch order nahi kiya. Kya mangwana hai?"
        : "You haven't added anything yet! What would you like to order?";
      s = addMessage(s, "ai", speak);
      return { newState: s, speak, cartUpdated: false };
    }
  }

  const parsed = parseItemFromTranscript(transcript);
  if (parsed) {
    const { item, qty, notes } = parsed;
    const existing = s.cart.findIndex(i => i.id === item.id);
    let newCart: CartItem[];
    let itemAction = "";

    if (existing !== -1) {
      // Update quantity
      newCart = s.cart.map((i, idx) =>
        idx === existing ? { ...i, qty: i.qty + qty } : i
      );
      itemAction = lang === "hindi"
        ? `${item.name} ki quantity ${qty} se badhaayi. Total ab ${newCart[existing].qty} ho gaya.`
        : `Updated to ${newCart[existing]?.qty ?? qty} × ${item.name}.`;
    } else {
      newCart = [...s.cart, { ...item, qty, notes: notes || undefined }];
      const noteStr = notes ? ` (${notes})` : "";
      const costNote = qty > 1 ? `₹${item.price} each, that's ₹${item.price * qty}` : `₹${item.price}`;
      itemAction = lang === "hindi"
        ? `${qty > 1 ? qty + " " : ""}${item.name}${noteStr} add kar diya. ${costNote} ka hai.`
        : `Added ${qty > 1 ? qty + " × " : ""}${item.name}${noteStr} — ${costNote}.`;
    }

    s = { ...s, cart: newCart, phase: "ordering", lastAddedCategory: item.category };
    cartUpdated = true;

    // Check if we should upsell
    const upsell = UPSELL_SUGGESTIONS[item.category];
    const upsellItems = upsell?.itemIds.filter(uid => !newCart.find(c => c.id === uid));

    if (upsellItems && upsellItems.length > 0 && Math.random() > 0.3) {
      // 70% chance to upsell
      s = { ...s, phase: "upselling", upsellPending: upsellItems };
      speak = `${itemAction} ${upsell.text}`;
    } else {
      speak = lang === "hindi"
        ? `${itemAction} Aur kuch mangwaoge?`
        : `${itemAction} Anything else you'd like to add?`;
    }

    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated };
  }

  // ── Silence / "that's it" handled by caller via timeout ──
  // Fallback response when nothing matched
  const fallbacks: Record<Language, string[]> = {
    english: [
      "I didn't catch that — could you repeat which dish you'd like?",
      "Sorry, I couldn't recognize that item. Try saying the dish name clearly.",
      "Could you be a bit more specific? For example, say 'one chicken biryani' or 'two butter naan'.",
    ],
    hindi: [
      "Mujhe samajh nahi aaya. Kaunsa dish chahiye?",
      "Phir se boliye, kya order karna hai?",
      "Dish ka naam clearly boliye, jaise 'ek chicken biryani' ya 'do butter naan'.",
    ],
  };
  const fb = fallbacks[lang][Math.floor(Math.random() * fallbacks[lang].length)];
  s = addMessage(s, "ai", fb);
  return { newState: s, speak: fb, cartUpdated: false };
}

// ── Silence trigger (call from page after 10s timeout) ───
export function triggerSilenceCheckout(state: ConvState): ConvOutput {
  let s = state;
  const lang = s.lang;

  if (s.cart.length === 0) {
    const speak = lang === "hindi"
      ? "Aapne abhi tak kuch order nahi kiya. Kya mangwana hai? Biryani, dosa, naan — jo bhi bolein!"
      : "You haven't added anything yet! Go ahead and tell me what you'd like — biryani, dosa, naan, anything at all.";
    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated: false };
  }

  const summary = formatCartSummary(s.cart, lang);
  s = { ...s, phase: "confirming" };
  s = addMessage(s, "ai", summary);
  return { newState: s, speak: summary, cartUpdated: false };
}

export function makeInitialState(lang: Language = "english"): ConvState {
  return {
    phase: "greeting",
    cart: [],
    lang,
    couponApplied: false,
    discount: 0,
    messages: [],
  };
}
