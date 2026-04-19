// ──────────────────────────────────────────────────────────────
// BolKeOrder — Conversation Engine  (v2 — NLP-Enhanced)
// Drives the state machine; now uses nlpLayer for pre-processing.
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

import {
  normaliseTranscript,
  getSmartFallback,
  getAddedResponse,
  getAnythingElse,
} from "@/lib/nlpLayer";

// ── Phase / State types ───────────────────────────────────────

export type ConvPhase =
  | "idle"
  | "greeting"
  | "ordering"
  | "upselling"
  | "summarizing"
  | "confirming"
  | "asking_coupon"
  | "comparing_prices"
  | "finalizing"
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
  /** Name of the last item added — enables "make it two", "ek aur" etc. */
  lastAddedItem?: string;
  lastAddedCategory?: string;
  upsellPending?: string[];
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
  speak: string | null;
  cartUpdated: boolean;
};

// ── Helpers ───────────────────────────────────────────────────

function calcTotal(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function formatCartSummary(cart: CartItem[], lang: Language): string {
  if (cart.length === 0)
    return lang === "hindi"
      ? "Abhi tak aapne kuch nahi choose kiya."
      : "Your cart is still empty.";

  const lines = cart.map(
    i => `${i.qty > 1 ? i.qty + " × " : ""}${i.name}${i.notes ? ` (${i.notes})` : ""}`
  );
  const total = calcTotal(cart) + 45;

  if (lang === "hindi") {
    return `Aapka order hai: ${lines.join(", ")}. Kul ₹${total} hoga taxes ke saath. Kya main yeh order place kar doon?`;
  }
  return `Alright! Your order: ${lines.join("; ")} — total ₹${total} with taxes. Shall I go ahead and confirm it?`;
}

function addMessage(
  state: ConvState,
  role: "ai" | "user",
  text: string
): ConvState {
  return {
    ...state,
    messages: [...state.messages, { role, text, ts: Date.now() }],
  };
}

// Randomly pick from an array of string variants
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Greeting ──────────────────────────────────────────────────

export function getGreeting(lang: Language): string {
  if (lang === "hindi") {
    return pick([
      "Namaste! BolKeOrder mein aapka swagat hai. Aaj Meghana Foods se kya mangna chahenge? Main aapki poori madad karunga!",
      "Jai ho! Main aapka BolKeOrder assistant hoon. Meghana Foods ka koi bhi dish boliye — main turant add kar dunga.",
    ]);
  }
  return pick([
    "Hello! Welcome to BolKeOrder. I'm here to take your order from Meghana Foods — just say what you'd like and I'll add it right away!",
    "Hi there! I'm your BolKeOrder voice assistant. Tell me what you'd like from Meghana Foods today — biryani, dosa, anything at all!",
  ]);
}

// ── Core Processor ────────────────────────────────────────────

export function processTranscript(
  rawTranscript: string,
  state: ConvState
): ConvOutput {
  const transcript = rawTranscript.trim();
  if (!transcript) return { newState: state, speak: null, cartUpdated: false };

  // ── NLP Pre-processing ────────────────────────────────────
  const nlp = normaliseTranscript(transcript, state.lastAddedItem);
  const text = nlp.normalisedText;
  const lower = text.toLowerCase();

  let s = addMessage(state, "user", transcript); // log original
  let speak: string | null = null;
  let cartUpdated = false;

  // ── Language switch (NLP intent or keyword) ───────────────
  if (
    nlp.intentOverride === "language_hindi" ||
    lower.includes("hindi") ||
    lower.includes("speak hindi")
  ) {
    s = { ...s, lang: "hindi" };
    speak = pick([
      "Theek hai! Ab main Hindi mein bolunga. Kya mangwana hai?",
      "Bilkul! Hindi mein baat karte hain. Kaunsa dish chahiye?",
    ]);
    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated };
  }
  if (
    nlp.intentOverride === "language_english" ||
    (lower.includes("english") && s.lang !== "english")
  ) {
    s = { ...s, lang: "english" };
    speak = "Sure! Back to English. What would you like to add?";
    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated };
  }

  const lang = s.lang;

  // ── Upselling phase ───────────────────────────────────────
  if (s.phase === "upselling") {
    const conf = detectConfirmation(text);
    const done = detectDoneOrdering(text);

    if (conf === "yes" && s.upsellPending?.length) {
      const item = findMenuItemById(s.upsellPending[0]);
      if (item) {
        const newCart = [...s.cart, { ...item, qty: 1 }];
        s = {
          ...s,
          cart: newCart,
          phase: "ordering",
          upsellPending: undefined,
          lastAddedItem: item.name,
          lastAddedCategory: item.category,
        };
        cartUpdated = true;
        speak =
          lang === "hindi"
            ? pick([
                `${item.name} bhi add kar diya! ₹${item.price} ka. Aur kuch?`,
                `Le lo ${item.name}! ${getAnythingElse("hindi")}`,
              ])
            : pick([
                `Added ${item.name} for ₹${item.price} — good choice! ${getAnythingElse("english")}`,
                `${item.name} is now on your order (₹${item.price}). ${getAnythingElse("english")}`,
              ]);
        s = addMessage(s, "ai", speak);
        return { newState: s, speak, cartUpdated };
      }
    }

    if (conf === "no" || done) {
      const summary = formatCartSummary(s.cart, lang);
      s = { ...s, phase: "confirming", upsellPending: undefined };
      s = addMessage(s, "ai", summary);
      return { newState: s, speak: summary, cartUpdated: false };
    }

    // Fall through — they may be adding a different item
    s = { ...s, phase: "ordering", upsellPending: undefined };
  }

  // ── Summarizing / Confirming phase ────────────────────────
  if (s.phase === "summarizing" || s.phase === "confirming") {
    const conf = detectConfirmation(text);
    if (conf === "yes") {
      s = { ...s, phase: "asking_coupon" };
      speak =
        lang === "hindi"
          ? pick([
              "Badiya! Kya aapke paas koi coupon code hai? Ya seedha order place karoon?",
              "Perfect! Coupon apply karoon ya direct order bhejoon?",
            ])
          : pick([
              "Perfect! Do you have a coupon code, or shall I place the order now?",
              "Great! Got a discount coupon? Say yes to apply or no to go ahead.",
            ]);
      s = addMessage(s, "ai", speak);
      return { newState: s, speak, cartUpdated };
    }
    if (conf === "no") {
      s = { ...s, phase: "ordering" };
      speak =
        lang === "hindi"
          ? "Theek hai! Kya add karoon ya hataaoon?"
          : "No problem! What would you like to change — add more, remove something?";
      s = addMessage(s, "ai", speak);
      return { newState: s, speak, cartUpdated };
    }
  }

  // ── Asking coupon phase ───────────────────────────────────
  if (s.phase === "asking_coupon") {
    const conf = detectConfirmation(text);
    const hasCoupon =
      lower.includes("apply") ||
      lower.includes("yes") ||
      lower.includes("haan");
    const noCoupon =
      lower.includes("no") ||
      lower.includes("nahi") ||
      lower.includes("skip") ||
      lower.includes("directly") ||
      lower.includes("place order");

    if (hasCoupon || conf === "yes") {
      const sub = calcTotal(s.cart);
      const disc = Math.floor(sub * 0.1);
      s = {
        ...s,
        phase: "comparing_prices",
        couponApplied: true,
        discount: disc,
      };
      speak =
        lang === "hindi"
          ? `Coupon apply ho gaya! Aapne ₹${disc} bachaye. Ab best price check kar raha hoon...`
          : `Coupon applied! You saved ₹${disc}. Finding the best deal across platforms now...`;
      s = addMessage(s, "ai", speak);
      return { newState: { ...s, phase: "comparing_prices" }, speak, cartUpdated: false };
    }

    if (noCoupon || conf === "no") {
      s = { ...s, phase: "comparing_prices", couponApplied: false };
      speak =
        lang === "hindi"
          ? "Theek hai. Ab main sab platforms par best price dhundh raha hoon..."
          : "Got it! Let me compare prices to find your best deal...";
      s = addMessage(s, "ai", speak);
      return { newState: { ...s, phase: "comparing_prices" }, speak, cartUpdated: false };
    }

    // Ambiguous
    speak =
      lang === "hindi"
        ? "Haan ya na? Coupon apply karoon?"
        : "Just say yes if you have a coupon, or no to place the order now.";
    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated };
  }

  // ── Remove intent ─────────────────────────────────────────
  const removeId = detectRemoveIntent(text);
  if (removeId) {
    const removed = s.cart.find(i => i.id === removeId);
    const newCart = s.cart.filter(i => i.id !== removeId);
    cartUpdated = newCart.length !== s.cart.length;
    s = { ...s, cart: newCart };

    if (removed && cartUpdated) {
      speak =
        lang === "hindi"
          ? pick([
              `${removed.name} remove kar diya. Aur kuch?`,
              `${removed.name} hata diya. Aur badlaav?`,
            ])
          : pick([
              `Removed ${removed.name}. Anything else to change?`,
              `${removed.name} is off your order. What else?`,
            ]);
    } else {
      speak =
        lang === "hindi"
          ? "Woh item cart mein nahi tha."
          : "That item wasn't in your cart.";
    }
    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated };
  }

  // ── Done signal (while ordering) ─────────────────────────
  if (s.phase === "ordering") {
    const doneSignal = detectDoneOrdering(text);
    if (doneSignal && s.cart.length > 0) {
      const summary = formatCartSummary(s.cart, lang);
      s = { ...s, phase: "confirming" };
      s = addMessage(s, "ai", summary);
      return { newState: s, speak: summary, cartUpdated: false };
    }
    if (doneSignal && s.cart.length === 0) {
      speak =
        lang === "hindi"
          ? "Aapne abhi kuch add nahi kiya. Kaunsa dish chahiye aapko?"
          : "You haven't added anything yet! What would you like to order?";
      s = addMessage(s, "ai", speak);
      return { newState: s, speak, cartUpdated: false };
    }
  }

  // ── Item parsing (NLP-enhanced) ───────────────────────────
  // Use the NLP-normalised text for parsing; fuzzy match may have
  // injected a canonical keyword so parseItemFromTranscript finds it.
  const parsed = parseItemFromTranscript(text);

  if (parsed) {
    const { item, qty, notes } = parsed;

    // Log if fuzzy matching helped
    if (nlp.fuzzyMatched) {
      console.info(
        `[NLP] Fuzzy match: "${nlp.fuzzyMatched.original}" → "${nlp.fuzzyMatched.matched}" (${item.name})`
      );
    }

    const existing = s.cart.findIndex(i => i.id === item.id);
    let newCart: CartItem[];

    if (existing !== -1) {
      newCart = s.cart.map((i, idx) =>
        idx === existing ? { ...i, qty: i.qty + qty } : i
      );
      const newQty = newCart[existing].qty;
      speak =
        lang === "hindi"
          ? `${item.name} ki quantity ${newQty} ho gayi. ${getAnythingElse("hindi")}`
          : `Updated to ${newQty} × ${item.name}. ${getAnythingElse("english")}`;
    } else {
      newCart = [...s.cart, { ...item, qty, notes: notes || undefined }];
      speak = getAddedResponse(lang, item.name, qty, item.price, notes);
    }

    s = {
      ...s,
      cart: newCart,
      phase: "ordering",
      lastAddedItem: item.name,
      lastAddedCategory: item.category,
    };
    cartUpdated = true;

    // ── Upsell (60% chance, smarter — skip if upsell items already in cart) ──
    const upsell = UPSELL_SUGGESTIONS[item.category];
    const upsellItems = upsell?.itemIds.filter(
      uid => !newCart.find(c => c.id === uid)
    );

    if (upsellItems && upsellItems.length > 0 && Math.random() > 0.4) {
      s = { ...s, phase: "upselling", upsellPending: upsellItems };
      speak = `${speak} ${upsell.text}`;
    }

    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated };
  }

  // ── Smart fallback (NLP-powered suggestion) ───────────────
  speak = getSmartFallback(transcript, lang);

  // If NLP found a suggestion, log it for debugging
  if (nlp.suggestion) {
    console.info(`[NLP] Suggestion: "${nlp.suggestion.name}" for input "${transcript}"`);
  }

  s = addMessage(s, "ai", speak);
  return { newState: s, speak, cartUpdated: false };
}

// ── Silence trigger ───────────────────────────────────────────

export function triggerSilenceCheckout(state: ConvState): ConvOutput {
  let s = state;
  const lang = s.lang;

  if (s.cart.length === 0) {
    const speak =
      lang === "hindi"
        ? pick([
            "Aapne abhi tak kuch nahi mangwaya. Koi bhi dish ka naam boliye!",
            "Kya sooch rahe hain? Biryani, dosa, naan — jo bhi pasand ho boliye!",
          ])
        : pick([
            "You haven't ordered anything yet — go ahead, name any dish!",
            "Still here! Tell me what you'd like — biryani, dosa, naan, anything from Meghana Foods.",
          ]);
    s = addMessage(s, "ai", speak);
    return { newState: s, speak, cartUpdated: false };
  }

  const summary = formatCartSummary(s.cart, lang);
  s = { ...s, phase: "confirming" };
  s = addMessage(s, "ai", summary);
  return { newState: s, speak: summary, cartUpdated: false };
}

// ── Initial state factory ─────────────────────────────────────

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
