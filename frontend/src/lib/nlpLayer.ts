// ──────────────────────────────────────────────────────────────
// BolKeOrder — NLP Intelligence Layer
//
// Acts as a pre-processor between raw Vapi/Web-Speech transcripts
// and the conversation engine. Applies:
//   1. Hinglish & common ASR phrase normalisation
//   2. Fuzzy keyword matching (Levenshtein distance)
//   3. Contextual quantity repairs ("make it two", "ek aur")
//   4. Smart fallback suggestions (nearest match)
//   5. Multi-item detection ("biryani aur naan dena")
// ──────────────────────────────────────────────────────────────

import { MENU, MenuItem, QUANTITY_WORDS } from "@/data/menu";

// ── Types ─────────────────────────────────────────────────────

export type NLPResult = {
  /** The cleaned, normalised transcript to pass to conversationEngine */
  normalisedText: string;
  /** If we found a strong fuzzy match that wasn't an exact hit */
  fuzzyMatched?: { original: string; matched: string; item: MenuItem };
  /** Suggested item when nothing confident matched — for smart fallback */
  suggestion?: MenuItem;
  /** Whether we detected multi-item phrasing */
  hasMultipleItems: boolean;
  /** Detected intent override (eg "done", "remove", "confirm") */
  intentOverride?: "done" | "remove" | "confirm_yes" | "confirm_no" | "language_hindi" | "language_english";
};

// ── 1. Phrase substitution table ──────────────────────────────
// Maps messy ASR output / Hinglish to canonical keywords
// Order matters — longer phrases first to avoid partial matches

const PHRASE_SUBS: [RegExp, string][] = [
  // Quantities — spoken forms
  [/\bek do\b/gi,                   "two"],
  [/\bdo teen\b/gi,                 "three"],
  [/\bteen char\b/gi,               "four"],

  // Number words spoken in Hindi
  [/\bsaath\b/gi,                   "7"],
  [/\baath\b/gi,                    "8"],
  [/\bnau\b/gi,                     "9"],
  [/\bdas\b/gi,                     "10"],

  // Chicken 65 — ASR often turns "65" into words
  [/\bsixty\s*[-–]?\s*five\b/gi,    "chicken 65"],
  [/\bsixty five\b/gi,              "chicken 65"],
  [/\b65\b/gi,                      "chicken 65"],

  // Biryani spelling noise
  [/\bbiryan[iy]\b/gi,              "biryani"],
  [/\bberyani\b/gi,                 "biryani"],
  [/\bbriyani\b/gi,                 "biryani"],
  [/\bbiriyani\b/gi,                "biryani"],
  [/\bbiryaani\b/gi,                "biryani"],

  // Dosa
  [/\bdosha\b/gi,                   "dosa"],
  [/\bdosha\b/gi,                   "dosa"],

  // Naan
  [/\bnaaan\b/gi,                   "naan"],
  [/\bnaaan\b/gi,                   "naan"],

  // Common Hinglish ordering phrases → canonical English
  [/\bchahiye\b/gi,                 "want"],
  [/\bdena\b/gi,                    "give"],
  [/\blena\b/gi,                    "take"],
  [/\bmangwao\b/gi,                 "order"],
  [/\bmangao\b/gi,                  "order"],
  [/\blaao\b/gi,                    "bring"],
  [/\blaana\b/gi,                   "bring"],
  [/\bkya hai\b/gi,                 "what is"],
  [/\bwala\b/gi,                    ""],          // "biryani wala" → "biryani"
  [/\bwaala\b/gi,                   ""],
  [/\bwali\b/gi,                    ""],

  // Butter chicken alternate ASR
  [/\bmurgh\s+makhani\b/gi,         "butter chicken"],
  [/\bmakhan\s+chicken\b/gi,        "butter chicken"],

  // Dal / daal
  [/\bdaal\b/gi,                    "dal"],

  // Paneer
  [/\bpanir\b/gi,                   "paneer"],
  [/\bpanir\b/gi,                   "paneer"],

  // Roti
  [/\bchapati\b/gi,                 "chapati"],
  [/\bchappati\b/gi,                "chapati"],

  // Idli / idly
  [/\bidly\b/gi,                    "idli"],

  // Tea / chai
  [/\bchay\b/gi,                    "chai"],

  // Lassi
  [/\blasee\b/gi,                   "lassi"],
  [/\blasee\b/gi,                   "lassi"],

  // "and" equivalents
  [/\baur\b/gi,                     " and "],
  [/\baur\b/gi,                     " and "],
  [/\btatha\b/gi,                   " and "],

  // Confirmation/done phrases in Hindi → English for downstream detection
  [/\btheek hai\b/gi,               "yes"],
  [/\bbilkul\b/gi,                  "yes"],
  [/\bhaan\b/gi,                    "yes"],
  [/\bha\b(?!\w)/gi,                "yes"],   // lone "ha"
  [/\bho\s+gaya\b/gi,               "done"],
  [/\bbas\b/gi,                     "done"],
  [/\bnahi\b/gi,                    "no"],
  [/\bnaa\b(?!\w)/gi,               "no"],
  [/\bhatao\b/gi,                   "remove"],
  [/\bnikalo\b/gi,                  "remove"],
  [/\bmat\s+dena\b/gi,              "remove"],
  [/\bnahi\s+chahiye\b/gi,          "remove"],
  [/\bbhejo\b/gi,                   "place order"],
  [/\border\s+karo\b/gi,            "place order"],
  [/\border\s+kar\b/gi,             "place order"],
  [/\bhindi\s+mein\s+bolo\b/gi,     "speak hindi"],
  [/\bhindi\s+me\s+bolo\b/gi,       "speak hindi"],
];

// ── 2. Levenshtein distance (cheap O(mn) for short strings) ──

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

/** 
 * Returns the keyword similarity score (0–1, higher = closer match).
 * Uses normalised Levenshtein so short and long keywords are comparable.
 */
function similarity(a: string, b: string): number {
  const dist = levenshtein(a.toLowerCase(), b.toLowerCase());
  return 1 - dist / Math.max(a.length, b.length, 1);
}

// ── 3. Fuzzy keyword search ────────────────────────────────────

type FuzzyHit = { item: MenuItem; keyword: string; score: number };

/**
 * Returns the best-scoring menu item for each "word window" in text,
 * using fuzzy matching over all keyword aliases.
 */
function fuzzyFindItems(text: string): FuzzyHit[] {
  const words = text.toLowerCase().split(/\s+/);
  const hits: FuzzyHit[] = [];
  const seen = new Set<string>();

  // Try 1-word, 2-word, 3-word windows from the text
  for (let len = 3; len >= 1; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const window = words.slice(i, i + len).join(" ");
      if (window.length < 3) continue; // skip tiny windows

      let best: FuzzyHit | null = null;

      for (const item of MENU) {
        if (seen.has(item.id)) continue;
        for (const kw of item.keywords) {
          const score = similarity(window, kw);
          if (score > 0.75 && (!best || score > best.score)) { // ≥75% similarity
            best = { item, keyword: kw, score };
          }
        }
      }

      if (best && !seen.has(best.item.id)) {
        hits.push(best);
        seen.add(best.item.id);
      }
    }
  }

  return hits.sort((a, b) => b.score - a.score);
}

// ── 4. Closest item suggestion (for smart fallback) ───────────

export function findClosestItem(text: string): MenuItem | undefined {
  const words = text.toLowerCase().split(/\s+/);
  let best: { item: MenuItem; score: number } | null = null;

  for (const item of MENU) {
    for (const kw of item.keywords) {
      // Try each word in the text against each keyword
      for (const w of words) {
        if (w.length < 3) continue;
        const s = similarity(w, kw);
        if (s > 0.6 && (!best || s > best.score)) {
          best = { item, score: s };
        }
      }
      // Also try full text vs keyword phrase
      const s = similarity(text.toLowerCase(), kw);
      if (s > 0.55 && (!best || s > best.score)) {
        best = { item, score: s };
      }
    }
  }

  return best?.item;
}

// ── 5. Multi-item detection ────────────────────────────────────

/**
 * Checks if the text likely contains multiple items
 * e.g. "biryani aur naan", "chicken biryani and two lassis"
 */
function detectMultiItem(text: string): boolean {
  return /\band\b|\baur\b|\btatha\b|,/.test(text.toLowerCase());
}

// ── 6. Contextual quantity repair ─────────────────────────────

/**
 * Handles utterances like:
 * - "make it two" → injects quantity signal for last-mentioned item
 * - "ek aur" → adds one more of implied item
 * - "actually three" → corrects quantity
 *
 * Returns a modified text with the implicit reference expanded, 
 * or null if no repair was needed.
 */
const QUANTITY_REPAIR_PATTERNS: RegExp[] = [
  /\bmake it (\w+)\b/i,
  /\bchange to (\w+)\b/i,
  /\bactually (\w+)\b/i,
  /\bi meant (\w+)\b/i,
  /\b(\w+) actually\b/i,
];

export function repairQuantityContext(
  text: string,
  lastItemName: string | undefined
): string {
  if (!lastItemName) return text;

  for (const pat of QUANTITY_REPAIR_PATTERNS) {
    const m = text.match(pat);
    if (m) {
      const numWord = m[1].toLowerCase();
      if (QUANTITY_WORDS[numWord] !== undefined) {
        // Replace the vague phrase with "<qty> <item>"
        return `${numWord} ${lastItemName}`.toLowerCase();
      }
    }
  }

  // "ek aur" / "one more" / "add one more"
  if (/\bone more\b|\bek aur\b|\bone more please\b/i.test(text)) {
    return `two ${lastItemName}`.toLowerCase();
  }

  return text;
}

// ── 7. Intent override detection ──────────────────────────────

function detectIntent(text: string): NLPResult["intentOverride"] | undefined {
  const t = text.toLowerCase();
  if (/\bspeak hindi\b|\bhindi\b/.test(t))   return "language_hindi";
  if (/\bspeak english\b|\benglish\b/.test(t)) return "language_english";
  return undefined;
}

// ── 8. Main normalise function (entry point) ──────────────────

/**
 * Takes raw ASR transcript + conversation context and returns an
 * enriched NLPResult with a cleaned transcript and metadata.
 *
 * @param raw          - Raw transcript from Vapi/Web Speech
 * @param lastItemName - Name of the last item mentioned (for context repair)
 */
export function normaliseTranscript(
  raw: string,
  lastItemName?: string
): NLPResult {
  if (!raw.trim()) {
    return { normalisedText: raw, hasMultipleItems: false };
  }

  // Step 1: Contextual quantity repair before any other processing
  let text = repairQuantityContext(raw, lastItemName);

  // Step 2: Apply phrase substitution table
  for (const [pattern, replacement] of PHRASE_SUBS) {
    text = text.replace(pattern, replacement);
  }

  // Step 3: Collapse multiple spaces
  text = text.replace(/\s+/g, " ").trim();

  // Step 4: Detect intent overrides
  const intentOverride = detectIntent(text);

  // Step 5: Try to find items via fuzzy matching
  const fuzzyHits = fuzzyFindItems(text);
  let fuzzyMatched: NLPResult["fuzzyMatched"] | undefined;

  if (fuzzyHits.length > 0) {
    const top = fuzzyHits[0];
    // Only report fuzzy match if the exact keyword wasn't already in text
    const exactHit = top.item.keywords.some(kw => text.toLowerCase().includes(kw));
    if (!exactHit && top.score > 0.78) {
      // Replace the approximate word(s) with the exact canonical keyword
      fuzzyMatched = {
        original: text,
        matched: top.keyword,
        item: top.item,
      };
      // Inject the canonical keyword into the text so downstream engine finds it
      text = text + " " + top.keyword;
    }
  }

  // Step 6: Smart fallback suggestion if no exact matches seem likely
  const suggestion = fuzzyHits.length === 0 ? findClosestItem(text) : undefined;

  return {
    normalisedText: text,
    fuzzyMatched,
    suggestion,
    hasMultipleItems: detectMultiItem(raw),
    intentOverride,
  };
}

// ── 9. Generate smart fallback response ──────────────────────

/**
 * When the engine can't match anything, call this to generate
 * an intelligent fallback that suggests the closest item.
 */
export function getSmartFallback(
  raw: string,
  lang: "english" | "hindi"
): string {
  const suggestion = findClosestItem(raw);

  if (suggestion) {
    if (lang === "hindi") {
      return `Maaf kijiye, main samajh nahi paaya. Kya aap "${suggestion.name}" maangna chahte the? Agar haan, toh seedha bol dijiye!`;
    }
    return `I didn't quite catch that — did you mean "${suggestion.name}" for ₹${suggestion.price}? Go ahead and say the name clearly!`;
  }

  // Generic varied fallbacks (no suggestion)
  const english = [
    "Hmm, I couldn't catch that. Could you say the dish name once more?",
    "Sorry, the name didn't come through clearly. Try saying just the dish name, like 'chicken biryani' or 'masala dosa'.",
    "I didn't get that one — speak a little slowly and say the dish name again?",
  ];
  const hindi = [
    "Maaf kijiye, samajh nahi aaya. Dish ka naam ek baar aur boliye?",
    "Thoda aur saaf boliye — jaise 'chicken biryani' ya 'masala dosa'.",
    "Yeh nahi sun paaya. Bas dish ka naam boliye, main turant add kar dunga!",
  ];

  const pool = lang === "hindi" ? hindi : english;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── 10. Response variety helpers ─────────────────────────────

/** 
 * Returns a varied, natural-sounding "item added" confirmation string.
 * This replaces the fixed template in conversationEngine.
 */
export function getAddedResponse(
  lang: "english" | "hindi",
  itemName: string,
  qty: number,
  price: number,
  notes?: string
): string {
  const noteStr = notes ? ` (${notes})` : "";
  const costNote = qty > 1 ? `₹${price * qty} total` : `₹${price}`;
  const qtyStr = qty > 1 ? `${qty} × ` : "";

  const english = [
    `Got it! Added ${qtyStr}${itemName}${noteStr} — ${costNote}. Anything else?`,
    `${qtyStr}${itemName}${noteStr} is on your order! That's ${costNote}. What else?`,
    `Perfect choice! ${qtyStr}${itemName}${noteStr} added for ${costNote}. Want something more?`,
    `Done — ${qtyStr}${itemName}${noteStr} added (${costNote}). Keep going or just say 'that's it'!`,
    `Sure! ${qtyStr}${itemName}${noteStr} at ${costNote}. What else can I get you?`,
  ];

  const hindi = [
    `Haan! ${qtyStr}${itemName}${noteStr} add kar diya — ${costNote} ka. Aur kuch?`,
    `${qtyStr}${itemName}${noteStr} aa gaya aapke order mein! ${costNote}. Kuch aur?`,
    `Bilkul! ${qtyStr}${itemName}${noteStr} ho gaya add — ${costNote}. Aur kya mangwaoge?`,
    `Perfect — ${qtyStr}${itemName}${noteStr} add ho gaya (${costNote}). Batao, kuch aur?`,
  ];

  const pool = lang === "hindi" ? hindi : english;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Varied "anything else?" prompts */
export function getAnythingElse(lang: "english" | "hindi"): string {
  const english = [
    "Anything else you'd like to add?",
    "What else can I get for you?",
    "Shall I add something more?",
    "Any other dishes or drinks?",
    "Want to add anything more to the order?",
  ];
  const hindi = [
    "Aur kuch mangwaoge?",
    "Kuch aur chahiye?",
    "Kya aur add karoon?",
    "Aur koi dish ya drink?",
    "Order mein kuch aur?",
  ];
  const pool = lang === "hindi" ? hindi : english;
  return pool[Math.floor(Math.random() * pool.length)];
}
