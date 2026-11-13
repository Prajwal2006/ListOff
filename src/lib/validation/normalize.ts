/**
 * Answer normalization — shared by the browser (instant duplicate detection) and the server
 * (authoritative validation). Deliberately conservative: it erases differences in case, spacing,
 * accents and punctuation, but never guesses at spelling. Spelling variants live in aliases.
 */

const LIGATURES: Record<string, string> = {
  ß: "ss",
  æ: "ae",
  œ: "oe",
  ø: "o",
  ł: "l",
  đ: "d",
  ð: "d",
  þ: "th",
  ı: "i",
};

export const MAX_ANSWER_LENGTH = 60;

export function normalizeAnswer(input: string): string {
  if (!input) return "";
  let s = input.slice(0, MAX_ANSWER_LENGTH * 2).toLowerCase();
  // Strip accents: "Café" -> "cafe", "São Paulo" -> "sao paulo".
  s = s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  s = s.replace(/[ßæœøłđðþı]/g, (c) => LIGATURES[c] ?? c);
  // Symbols that carry meaning in names: C++, C#, AT&T, Rock & Roll.
  s = s.replace(/&/g, " and ").replace(/\+/g, " plus ").replace(/#/g, " sharp ");
  // Apostrophes join words rather than split them: "McDonald's" -> "mcdonalds".
  s = s.replace(/['’‘`´]/g, "");
  // Everything else that isn't a letter or digit becomes a space.
  s = s.replace(/[^a-z0-9]+/g, " ").trim();
  // A leading article rarely matters: "The Beatles" == "Beatles".
  s = s.replace(/^the\s+/, "");
  return s;
}

/** Singularize the last word of an already-normalized phrase using simple English rules. */
export function singularize(normalized: string): string {
  const idx = normalized.lastIndexOf(" ");
  const head = idx === -1 ? "" : normalized.slice(0, idx + 1);
  const w = idx === -1 ? normalized : normalized.slice(idx + 1);
  if (w.length <= 3) return normalized;
  let out = w;
  if (w.endsWith("ies") && w.length > 4) out = w.slice(0, -3) + "y";
  else if (w.endsWith("oes")) out = w.slice(0, -2);
  else if (/(ches|shes|xes|sses|zzes)$/.test(w)) out = w.slice(0, -2);
  else if (w.endsWith("s") && !/(ss|us|is)$/.test(w)) out = w.slice(0, -1);
  return head + out;
}

/** Remove all spaces: lets "spider man" match "spiderman" and "water melon" match "watermelon". */
export function compact(normalized: string): string {
  return normalized.replace(/\s+/g, "");
}

const SWAPS: Array<[RegExp, string]> = [
  [/\bsaint\b/g, "st"],
  [/\bst\b/g, "saint"],
  [/\bmount\b/g, "mt"],
  [/\bmt\b/g, "mount"],
  [/\band\b/g, ""],
];

/** Equivalent spellings of a normalized key that are safe to index (St./Saint, Mt./Mount, and/&). */
export function keyVariants(normalized: string): string[] {
  const out = new Set<string>([normalized]);
  for (const [re, rep] of SWAPS) {
    if (re.test(normalized)) {
      re.lastIndex = 0;
      const v = normalized.replace(re, rep).replace(/\s+/g, " ").trim();
      if (v) out.add(v);
    }
    re.lastIndex = 0;
  }
  return [...out];
}

/** Normalizes a display name for uniqueness checks inside a lobby. */
export function nameKey(displayName: string): string {
  return displayName.trim().toLowerCase().replace(/\s+/g, " ");
}
