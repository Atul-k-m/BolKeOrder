// ──────────────────────────────────────────────────────────────
// BolKeOrder — Expanded Menu Dataset
// 60+ items across 9 categories with vernacular keyword aliases,
// category pairings for upsell suggestions.
// ──────────────────────────────────────────────────────────────

export type MenuCategory =
  | "starters"
  | "rice"
  | "main_veg"
  | "main_nonveg"
  | "breads"
  | "south_indian"
  | "snacks"
  | "desserts"
  | "beverages";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  isVeg: boolean;
  description: string;
  keywords: string[];
  pairsWellWith?: string[]; // IDs of items that go well together (for upsell)
};

export const MENU: MenuItem[] = [
  // ── STARTERS ──────────────────────────────────────────────
  { id: "s1",  name: "Samosa (2 pcs)",       price: 40,  category: "starters",    isVeg: true,  description: "Crispy potato-filled pastry",         keywords: ["samosa", "samose", "samosay"] },
  { id: "s2",  name: "Paneer Tikka",          price: 220, category: "starters",    isVeg: true,  description: "Grilled cottage cheese with spices",   keywords: ["paneer tikka", "paneer tika", "tikka"] },
  { id: "s3",  name: "Chicken 65",            price: 250, category: "starters",    isVeg: false, description: "Deep-fried spicy chicken",              keywords: ["chicken 65", "sixty five"] },
  { id: "s4",  name: "Veg Spring Roll (4 pcs)",price: 140, category: "starters",   isVeg: true,  description: "Crispy vegetable rolls",               keywords: ["spring roll", "spring rolls"] },
  { id: "s5",  name: "Chicken Wings",         price: 280, category: "starters",    isVeg: false, description: "Spiced crispy chicken wings",           keywords: ["wings", "chicken wings"] },
  { id: "s6",  name: "Hara Bhara Kebab",      price: 180, category: "starters",    isVeg: true,  description: "Green pea and spinach kebabs",         keywords: ["hara bhara kabab", "hara bhara kebab", "kebab", "kabab"] },

  // ── RICE ──────────────────────────────────────────────────
  { id: "r1",  name: "Chicken Biryani",       price: 350, category: "rice",        isVeg: false, description: "Basmati rice with spiced chicken",     keywords: ["chicken biryani", "murgh biryani", "biryani"], pairsWellWith: ["b1", "bev3"] },
  { id: "r2",  name: "Mutton Biryani",        price: 450, category: "rice",        isVeg: false, description: "Slow-cooked mutton with rice",         keywords: ["mutton biryani", "gosht biryani", "mutton"], pairsWellWith: ["b1", "bev3"] },
  { id: "r3",  name: "Veg Biryani",           price: 260, category: "rice",        isVeg: true,  description: "Aromatic vegetable rice",              keywords: ["veg biryani", "vegetable biryani"], pairsWellWith: ["b1", "bev3"] },
  { id: "r4",  name: "Egg Biryani",           price: 280, category: "rice",        isVeg: false, description: "Biryani with boiled eggs",             keywords: ["egg biryani", "anda biryani", "anda"], pairsWellWith: ["b1"] },
  { id: "r5",  name: "Fried Rice",            price: 200, category: "rice",        isVeg: true,  description: "Indo-Chinese egg fried rice",          keywords: ["fried rice", "fry rice", "fride rice"] },
  { id: "r6",  name: "Curd Rice",             price: 120, category: "rice",        isVeg: true,  description: "Soothing yogurt rice with tempering",  keywords: ["curd rice", "dahi rice", "thayir sadam", "thair sadam"] },

  // ── MAIN COURSE VEG ───────────────────────────────────────
  { id: "mv1", name: "Paneer Butter Masala",  price: 300, category: "main_veg",    isVeg: true,  description: "Rich tomato-cream paneer curry",       keywords: ["paneer butter masala", "butter paneer", "paneer masala", "paneer"], pairsWellWith: ["b1", "b2"] },
  { id: "mv2", name: "Palak Paneer",          price: 280, category: "main_veg",    isVeg: true,  description: "Spinach and cottage cheese curry",     keywords: ["palak paneer", "saag paneer", "palak"] },
  { id: "mv3", name: "Dal Makhani",           price: 220, category: "main_veg",    isVeg: true,  description: "Buttery slow-cooked black lentils",    keywords: ["dal makhani", "daal makhani", "makhani dal", "black dal"], pairsWellWith: ["b1", "b3"] },
  { id: "mv4", name: "Dal Tadka",             price: 180, category: "main_veg",    isVeg: true,  description: "Yellow lentils with tempering",        keywords: ["dal tadka", "daal tadka", "yellow dal", "daal fry", "dal fry"] },
  { id: "mv5", name: "Mix Veg Curry",         price: 240, category: "main_veg",    isVeg: true,  description: "Seasonal vegetables in onion-tomato gravy", keywords: ["mix veg", "mixed vegetable", "veg curry"] },
  { id: "mv6", name: "Chana Masala",          price: 220, category: "main_veg",    isVeg: true,  description: "Spiced chickpea curry",                keywords: ["chana masala", "chole masala", "chole", "chickpea"] },
  { id: "mv7", name: "Aloo Gobi",             price: 200, category: "main_veg",    isVeg: true,  description: "Potato and cauliflower stir-fry",      keywords: ["aloo gobi", "aloo gobhi", "potato cauliflower"] },
  { id: "mv8", name: "Kadai Paneer",          price: 320, category: "main_veg",    isVeg: true,  description: "Paneer in spiced bell pepper gravy",   keywords: ["kadai paneer", "karahi paneer"] },

  // ── MAIN COURSE NON-VEG ───────────────────────────────────
  { id: "mn1", name: "Butter Chicken",        price: 360, category: "main_nonveg", isVeg: false, description: "Mild, creamy tomato chicken curry",    keywords: ["butter chicken", "murgh makhani", "butter murgh"], pairsWellWith: ["b1", "b2"] },
  { id: "mn2", name: "Chicken Tikka Masala",  price: 380, category: "main_nonveg", isVeg: false, description: "Grilled chicken in smoky masala",      keywords: ["chicken tikka masala", "tikka masala"], pairsWellWith: ["b1"] },
  { id: "mn3", name: "Mutton Rogan Josh",     price: 420, category: "main_nonveg", isVeg: false, description: "Kashmiri-style braised mutton",         keywords: ["rogan josh", "mutton rogan", "rogan"] },
  { id: "mn4", name: "Fish Curry",            price: 340, category: "main_nonveg", isVeg: false, description: "Tangy coastal fish in coconut gravy",  keywords: ["fish curry", "machli", "meen kuzhambu"] },
  { id: "mn5", name: "Egg Curry",             price: 220, category: "main_nonveg", isVeg: false, description: "Boiled eggs in spiced onion gravy",    keywords: ["egg curry", "anda curry", "anda masala"] },
  { id: "mn6", name: "Chicken Chettinad",     price: 390, category: "main_nonveg", isVeg: false, description: "Spicy South Indian chicken curry",     keywords: ["chettinad", "chicken chettinad"] },

  // ── BREADS ────────────────────────────────────────────────
  { id: "b1",  name: "Butter Naan",           price: 60,  category: "breads",      isVeg: true,  description: "Soft, buttered oven-baked bread",      keywords: ["butter naan", "naan", "nan"] },
  { id: "b2",  name: "Garlic Naan",           price: 80,  category: "breads",      isVeg: true,  description: "Naan topped with garlic and herbs",    keywords: ["garlic naan", "garlic nan", "lahsun naan"] },
  { id: "b3",  name: "Tandoori Roti",         price: 30,  category: "breads",      isVeg: true,  description: "Whole-wheat clay-oven bread",          keywords: ["tandoori roti", "roti", "chapati", "chapatti"] },
  { id: "b4",  name: "Plain Paratha",         price: 50,  category: "breads",      isVeg: true,  description: "Layered unleavened wheat bread",       keywords: ["paratha", "parantha", "plain paratha"] },
  { id: "b5",  name: "Aloo Paratha",          price: 90,  category: "breads",      isVeg: true,  description: "Potato-stuffed fried bread",           keywords: ["aloo paratha", "aloo parantha", "potato paratha"] },
  { id: "b6",  name: "Poori (4 pcs)",         price: 60,  category: "breads",      isVeg: true,  description: "Deep-fried puffed bread",              keywords: ["poori", "puri", "puri sabji"] },

  // ── SOUTH INDIAN ──────────────────────────────────────────
  { id: "si1", name: "Masala Dosa",           price: 120, category: "south_indian", isVeg: true, description: "Crispy crepe with spiced potato filling",keywords: ["masala dosa", "dosa", "dosha"], pairsWellWith: ["bev2"] },
  { id: "si2", name: "Plain Dosa",            price: 80,  category: "south_indian", isVeg: true, description: "Thin crispy rice crepe",               keywords: ["plain dosa", "sada dosa"] },
  { id: "si3", name: "Rava Dosa",             price: 130, category: "south_indian", isVeg: true, description: "Semolina crepe with onion and chillies",keywords: ["rava dosa", "rawa dosa", "semolina dosa"] },
  { id: "si4", name: "Idli Sambar (3 pcs)",   price: 80,  category: "south_indian", isVeg: true, description: "Steamed rice cakes with lentil soup",  keywords: ["idli sambar", "idli", "idly"], pairsWellWith: ["bev2"] },
  { id: "si5", name: "Medu Vada (2 pcs)",     price: 90,  category: "south_indian", isVeg: true, description: "Crispy lentil doughnuts with sambar",  keywords: ["medu vada", "vada", "vade", "vadai"] },
  { id: "si6", name: "Uttapam",               price: 110, category: "south_indian", isVeg: true, description: "Thick pancake with onion and tomato",  keywords: ["uttapam", "utthapam", "uthappam"] },

  // ── SNACKS ────────────────────────────────────────────────
  { id: "sn1", name: "Pav Bhaji",             price: 140, category: "snacks",      isVeg: true,  description: "Spiced vegetable mash with butter rolls",keywords: ["pav bhaji", "pav", "bhaji"] },
  { id: "sn2", name: "Chole Bhature",         price: 160, category: "snacks",      isVeg: true,  description: "Fluffy fried bread with chickpea curry",  keywords: ["chole bhature", "bhature", "chole bature"] },
  { id: "sn3", name: "Vada Pav",              price: 50,  category: "snacks",      isVeg: true,  description: "Mumbai's favorite potato slider",       keywords: ["vada pav", "vada pao", "wada pav"] },
  { id: "sn4", name: "Aloo Tikki (3 pcs)",    price: 80,  category: "snacks",      isVeg: true,  description: "Spiced potato patties",                keywords: ["aloo tikki", "aloo tiki", "tikki"] },
  { id: "sn5", name: "Bhel Puri",             price: 70,  category: "snacks",      isVeg: true,  description: "Puffed rice with chutneys and sev",     keywords: ["bhel puri", "bhel", "puri"] },

  // ── DESSERTS ──────────────────────────────────────────────
  { id: "d1",  name: "Gulab Jamun (2 pcs)",   price: 80,  category: "desserts",    isVeg: true,  description: "Soft milk-solid balls in rose syrup",  keywords: ["gulab jamun", "gulab jamon", "jamun", "sweet"] },
  { id: "d2",  name: "Rasmalai (2 pcs)",       price: 90,  category: "desserts",    isVeg: true,  description: "Saffron-cream soaked cottage cheese",  keywords: ["rasmalai", "ras malai"] },
  { id: "d3",  name: "Kheer",                  price: 100, category: "desserts",    isVeg: true,  description: "Rice pudding with cardamom and nuts",  keywords: ["kheer", "rice pudding", "phirni"] },
  { id: "d4",  name: "Gajar Halwa",            price: 110, category: "desserts",    isVeg: true,  description: "Carrot pudding with ghee and milk",    keywords: ["gajar halwa", "carrot halwa", "halwa"] },
  { id: "d5",  name: "Ice Cream (2 scoops)",   price: 120, category: "desserts",    isVeg: true,  description: "Vanilla/chocolate/mango ice cream",    keywords: ["ice cream", "icecream", "ice kream", "kulfi"] },

  // ── BEVERAGES ─────────────────────────────────────────────
  { id: "bev1", name: "Masala Chai",           price: 40,  category: "beverages",   isVeg: true,  description: "Spiced Indian milk tea",               keywords: ["masala chai", "chai", "tea", "chay"] },
  { id: "bev2", name: "Filter Coffee",         price: 60,  category: "beverages",   isVeg: true,  description: "South Indian decoction coffee",        keywords: ["filter coffee", "coffee", "kaapi", "kapi"] },
  { id: "bev3", name: "Sweet Lassi",           price: 90,  category: "beverages",   isVeg: true,  description: "Chilled sweetened yogurt drink",       keywords: ["sweet lassi", "lassi", "dahi lassi"] },
  { id: "bev4", name: "Mango Lassi",           price: 110, category: "beverages",   isVeg: true,  description: "Mango and yogurt smoothie",            keywords: ["mango lassi", "aam lassi"] },
  { id: "bev5", name: "Cold Coffee",           price: 120, category: "beverages",   isVeg: true,  description: "Chilled coffee with milk froth",       keywords: ["cold coffee", "iced coffee"] },
  { id: "bev6", name: "Fresh Lime Soda",       price: 70,  category: "beverages",   isVeg: true,  description: "Tangy sparkling lime drink",           keywords: ["lime soda", "nimbu soda", "fresh lime", "nimbu pani"] },
  { id: "bev7", name: "Buttermilk (Chaas)",    price: 50,  category: "beverages",   isVeg: true,  description: "Spiced chilled buttermilk",            keywords: ["buttermilk", "chaas", "chhas", "mattha"] },
  { id: "bev8", name: "Masala Soda",           price: 60,  category: "beverages",   isVeg: true,  description: "Spiced fizzy soda with masala",        keywords: ["masala soda"] },
];


// ── Number word mapping (Hindi + English) ─────────────────
export const QUANTITY_WORDS: Record<string, number> = {
  "one": 1,   "ek": 1,    "एक": 1,    "1": 1,
  "two": 2,   "do": 2,    "दो": 2,    "2": 2,   "dono": 2,
  "three": 3, "teen": 3,  "तीन": 3,   "3": 3,
  "four": 4,  "char": 4,  "चार": 4,   "4": 4,
  "five": 5,  "paanch": 5,"पांच": 5,  "5": 5,
  "six": 6,   "che": 6,   "6": 6,
  "half": 0.5, "aadha": 0.5,
  "a": 1, "an": 1,
  "couple": 2, "few": 3,
};

// ── Customization modifier detection ─────────────────────
export const CUSTOMIZATIONS: { keyword: string; tag: string }[] = [
  { keyword: "extra spicy",     tag: "extra spicy" },
  { keyword: "spicy",           tag: "spicy" },
  { keyword: "less spicy",      tag: "less spicy" },
  { keyword: "mild",            tag: "mild" },
  { keyword: "no onion",        tag: "no onion" },
  { keyword: "without onion",   tag: "no onion" },
  { keyword: "no garlic",       tag: "no garlic" },
  { keyword: "extra cheese",    tag: "extra cheese" },
  { keyword: "no butter",       tag: "no butter" },
  { keyword: "well done",       tag: "well done" },
  { keyword: "half plate",      tag: "half portion" },
  { keyword: "full plate",      tag: "full portion" },
  { keyword: "extra sauce",     tag: "extra sauce" },
  { keyword: "jain",            tag: "Jain (no root veg)" },
];

// ── Upsell suggestions by category ───────────────────────
export const UPSELL_SUGGESTIONS: Record<MenuCategory, { text: string; itemIds: string[] }> = {
  rice: {
    text: "Rice dishes go great with some bread! Want Butter Naan for ₹60 or a chilled Lassi for ₹90?",
    itemIds: ["b1", "bev3"],
  },
  main_veg: {
    text: "Shall I add some Butter Naan or Tandoori Roti to go with that?",
    itemIds: ["b1", "b3"],
  },
  main_nonveg: {
    text: "That pairs wonderfully with Butter Naan! Want some for ₹60?",
    itemIds: ["b1"],
  },
  south_indian: {
    text: "South Indian food goes perfectly with Filter Coffee! Want one for ₹60?",
    itemIds: ["bev2"],
  },
  starters: {
    text: "Great starter! Should I also start building your main course?",
    itemIds: [],
  },
  breads: {
    text: "Would you like to add a dal or curry to go with the bread?",
    itemIds: ["mv3", "mv4"],
  },
  snacks: {
    text: "Want something to drink with that? We have Masala Chai for ₹40 or Lassi for ₹90.",
    itemIds: ["bev1", "bev3"],
  },
  desserts: {
    text: "Sweet choice! Anything else or shall I wrap up the order?",
    itemIds: [],
  },
  beverages: {
    text: "Good pick! Would you like to add anything else to eat with it?",
    itemIds: [],
  },
};

// ── Core finding function with qty extraction ─────────────
export type CartItem = MenuItem & { qty: number; notes?: string };

export function parseItemFromTranscript(text: string): { item: MenuItem; qty: number; notes: string } | null {
  const lower = text.toLowerCase();

  // Find matching menu item
  let matched: MenuItem | null = null;
  let matchedAt = Infinity;

  for (const item of MENU) {
    for (const kw of item.keywords) {
      const idx = lower.indexOf(kw);
      if (idx !== -1 && idx < matchedAt) {
        matched = item;
        matchedAt = idx;
      }
    }
  }

  if (!matched) return null;

  // Extract quantity — look in a window of 15 chars before the item keyword
  let qty = 1;
  const beforeItem = lower.slice(Math.max(0, matchedAt - 20), matchedAt);
  for (const [word, num] of Object.entries(QUANTITY_WORDS)) {
    if (beforeItem.includes(word + " ") || beforeItem.endsWith(word)) {
      qty = num;
      break;
    }
  }
  // Also check digit immediately before
  const digitMatch = beforeItem.match(/(\d+)\s*$/);
  if (digitMatch) qty = parseInt(digitMatch[1]);

  // Extract customizations
  const notes = CUSTOMIZATIONS
    .filter(c => lower.includes(c.keyword))
    .map(c => c.tag)
    .join(", ");

  return { item: matched, qty, notes };
}

export function detectRemoveIntent(text: string): string | null {
  const lower = text.toLowerCase();
  const removeWords = ["remove", "cancel", "delete", "nahi chahiye", "mat dena", "hatao", "nikalo", "don't want"];
  if (!removeWords.some(w => lower.includes(w))) return null;

  for (const item of MENU) {
    for (const kw of item.keywords) {
      if (lower.includes(kw)) return item.id;
    }
  }
  return null;
}

export function detectConfirmation(text: string): "yes" | "no" | null {
  const lower = text.toLowerCase();
  if (/\b(yes|haan|ha|correct|confirm|order it|bilkul|theek hai|okay|ok|sure|absolutely|go ahead|place it)\b/.test(lower)) return "yes";
  if (/\b(no|nahi|nope|cancel|change|ruko|wait|ek sec)\b/.test(lower)) return "no";
  return null;
}

export function findMenuItemById(id: string): MenuItem | undefined {
  return MENU.find(i => i.id === id);
}
