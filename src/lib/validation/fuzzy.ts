/**
 * Spelling-tolerance primitives for the autocorrect matcher. Deterministic and local — no AI.
 */

/**
 * Optimal-string-alignment distance (Levenshtein + adjacent transpositions), with an early exit:
 * returns `max + 1` as soon as the distance is known to exceed `max`.
 */
export function editDistance(a: string, b: string, max: number): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  if (la === 0) return lb;
  if (lb === 0) return la;

  let prev2: number[] = new Array(lb + 1).fill(0);
  let prev: number[] = Array.from({ length: lb + 1 }, (_, j) => j);
  let cur: number[] = new Array(lb + 1).fill(0);

  for (let i = 1; i <= la; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= lb; j++) {
      const cb = b.charCodeAt(j - 1);
      const cost = ca === cb ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && ca === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === cb) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    [prev2, prev, cur] = [prev, cur, prev2];
  }
  return prev[lb];
}

/** How many typos to forgive for an answer of this many letters. Short words must be (nearly) exact. */
export function allowedTypos(length: number): number {
  if (length <= 4) return 0;
  if (length <= 7) return 1;
  if (length <= 11) return 2;
  return 3;
}

/**
 * A rough English sound key: words that are spelled differently but sound the same collapse to the
 * same key ("brocoli" / "broccoli", "filipines" / "philippines", "cinamon" / "cinnamon",
 * "chaikovsky" / "tchaikovsky"). Input should already be normalized (lowercase a–z0–9, spaces).
 */
export function soundKey(s: string): string {
  let k = s.replace(/\s+/g, "");
  k = k
    .replace(/^tch/, "ch")
    .replace(/^kn|^gn|^pn|^wr|^ps/, (m) => m[1])
    .replace(/ph/g, "f")
    .replace(/gh(?=[^aeiou]|$)/g, "")
    .replace(/ght/g, "t")
    .replace(/sch/g, "sk")
    .replace(/tch/g, "ch")
    .replace(/ck/g, "k")
    .replace(/c(?=[eiy])/g, "s")
    .replace(/c/g, "k")
    .replace(/q/g, "k")
    .replace(/x/g, "ks")
    .replace(/z/g, "s")
    .replace(/dg(?=[eiy])/g, "j")
    .replace(/wh/g, "w")
    .replace(/y/g, "i")
    .replace(/ee|ea|ie/g, "i")
    .replace(/oo|ou/g, "u");
  // Collapse doubled letters, then drop vowels after the first letter (consonant skeleton).
  k = k.replace(/(.)\1+/g, "$1");
  return k.length ? k[0] + k.slice(1).replace(/[aeiou]/g, "") : k;
}

/** Vowels in order — short words that sound alike must also keep their vowels ("sago" is not "sage"). */
export function vowelPattern(s: string): string {
  return s.replace(/[^aeiouy]/g, "");
}

/**
 * Words people routinely drop when naming something ("Brussels" for Brussels sprouts). A partial
 * name only counts when everything left out is one of these, so "Apple" never becomes "Apple mint",
 * "Sudan" never becomes "South Sudan" and "Oklahoma" never becomes "Oklahoma City".
 */
export const DROPPABLE_WORDS = new Set([
  "the", "of", "and", "a", "an", "de", "la", "le", "el", "da", "du", "von", "van",
  "sprout", "sprouts", "squash",
]);

/** Words too generic to identify an answer on their own when typed as a partial name. */
export const GENERIC_WORDS = new Set([
  "the", "of", "and", "a", "an", "in", "on", "de", "la", "le", "el", "von", "van", "da",
  "new", "north", "south", "east", "west", "central", "great", "little", "big", "old", "upper", "lower",
  "saint", "st", "san", "santa", "united", "republic", "kingdom", "island", "islands", "city", "state",
  "states", "river", "lake", "mount", "mountain", "sea", "ocean", "national", "park", "fruit", "tree",
  "dog", "cat", "fish", "bird", "game", "games", "movie", "film", "show", "series", "part", "chapter",
  "red", "blue", "green", "black", "white", "yellow", "golden", "royal", "sweet", "wild", "common",
]);
