import { allowedTypos, DROPPABLE_WORDS, editDistance, GENERIC_WORDS, soundKey, vowelPattern } from "./fuzzy";
import { compact, keyVariants, normalizeAnswer, singularize } from "./normalize";

export interface IndexedAnswer {
  id: number;
  canonical: string;
  normalized: string;
  aliases: string[]; // already normalized
}

export interface AnswerValidationResult {
  submittedAnswer: string;
  canonicalAnswer: string | null;
  isValid: boolean;
  isDuplicate: boolean;
}

export type MatchMethod = "exact" | "loose" | "typo" | "sound" | "partial";

export interface MatchResult {
  answerId: number | null;
  canonical: string | null;
  normalized: string;
  /** How the answer was recognized. Anything other than exact/loose means it was autocorrected. */
  method: MatchMethod | null;
}

const AMBIGUOUS = -1;

/**
 * An in-memory lookup structure for one topic's answers.
 *
 * Matching order (first hit wins):
 *   1. exact normalized answer or alias (incl. St./Saint and Mt./Mount variants)
 *   2. exact match after singularizing the submission ("grapes" -> "grape")
 *   3. "loose" keys — spaces removed and/or singular forms — only when that loose key points to a
 *      single answer. Ambiguous loose keys never match, so loosening can't accept a wrong answer.
 *   4. autocorrect, in order of confidence:
 *        typo    — within a length-scaled number of edits (insert/delete/replace/swap) of one answer
 *        sound   — spelled differently but sounds the same ("brocoli", "filipines")
 *        partial — a distinctive word that appears in exactly one multi-word answer ("passion")
 *      Every autocorrect step requires a single clear winner; ties are rejected rather than guessed.
 */
export class TopicIndex {
  private primary = new Map<string, number>();
  private loose = new Map<string, number>();
  private byId = new Map<number, IndexedAnswer>();
  /** Compact (space-free) spellings with their answer — the candidates for typo/sound matching. */
  private fuzzyKeys: { key: string; sound: string; id: number }[] = [];
  /** Distinctive single words → answers containing them (for partial names). */
  private words = new Map<string, Set<number>>();

  constructor(answers: IndexedAnswer[]) {
    for (const a of answers) {
      this.byId.set(a.id, a);
      for (const key of [a.normalized, ...a.aliases]) {
        for (const v of keyVariants(key)) {
          if (!this.primary.has(v)) this.primary.set(v, a.id);
        }
      }
    }
    for (const [key, id] of this.primary) {
      for (const lk of new Set([compact(key), compact(singularize(key)), singularize(key)])) {
        const existing = this.loose.get(lk);
        if (existing === undefined) this.loose.set(lk, id);
        else if (existing !== id) this.loose.set(lk, AMBIGUOUS);
      }
      const c = compact(key);
      this.fuzzyKeys.push({ key: c, sound: soundKey(c), id });
      const tokens = key.split(" ");
      if (tokens.length > 1) {
        for (const t of tokens) {
          if (t.length < 5 || GENERIC_WORDS.has(t) || /^d+$/.test(t)) continue;
          // Only when the rest of the name is filler ("New" Mexico, Brussels "sprouts").
          if (!tokens.every((o) => o === t || DROPPABLE_WORDS.has(o))) continue;
          const set = this.words.get(t) ?? new Set<number>();
          set.add(id);
          this.words.set(t, set);
        }
      }
    }
  }

  get size() {
    return this.byId.size;
  }

  get(id: number) {
    return this.byId.get(id);
  }

  all() {
    return [...this.byId.values()];
  }

  /**
   * `isKnownAnswer` (optional) says whether a normalized text is a real answer anywhere in the
   * knowledge base. Real names are never "corrected" into a different one: "Slovenia" stays
   * Slovenia (and misses) instead of becoming Slovakia, "Iceland" never becomes Ireland.
   */
  match(submitted: string, opts: { autocorrect?: boolean; isKnownAnswer?: (normalized: string) => boolean } = {}): MatchResult {
    const normalized = normalizeAnswer(submitted);
    const miss: MatchResult = { answerId: null, canonical: null, normalized, method: null };
    if (!normalized) return miss;
    const hit = (id: number, method: MatchMethod): MatchResult => ({
      answerId: id,
      canonical: this.byId.get(id)!.canonical,
      normalized,
      method,
    });

    const sing = singularize(normalized);
    const exact = this.primary.get(normalized) ?? this.primary.get(sing);
    if (exact !== undefined) return hit(exact, "exact");
    for (const lk of [compact(normalized), compact(sing)]) {
      const id = this.loose.get(lk);
      if (id !== undefined && id !== AMBIGUOUS) return hit(id, "loose");
    }
    if (opts.autocorrect === false) return miss;
    if (opts.isKnownAnswer && (opts.isKnownAnswer(normalized) || opts.isKnownAnswer(sing))) return miss;

    // Try the word as typed first, then without a plural "s".
    const forms = [...new Set([compact(normalized), compact(sing)])];
    let tied = false;
    for (const typed of forms) {
      const typo = this.closest(typed);
      if (typo === AMBIGUOUS) {
        tied = true; // equally close to two answers by spelling: only a sound match may decide
        break;
      }
      if (typo !== null) return hit(typo, "typo");
    }
    for (const typed of forms) {
      const sound = this.soundAlike(typed);
      if (sound !== null) return hit(sound, "sound");
    }
    if (tied) return miss;
    const partial = this.partial(normalized);
    if (partial !== null) return hit(partial, "partial");
    return miss;
  }

  /** The single answer within the allowed number of typos; AMBIGUOUS if two are equally close. */
  private closest(typed: string): number | null {
    const max = allowedTypos(typed.length);
    if (max === 0) return null;
    let best = max + 1;
    let bestId: number | null = null;
    let tie = false;
    for (const { key, id } of this.fuzzyKeys) {
      // A typo can't turn a much shorter word into a long answer (or vice versa).
      if (Math.abs(key.length - typed.length) > max) continue;
      // People rarely misspell the first letter; requiring it stops "cloves" becoming "chives".
      if (key[0] !== typed[0]) continue;
      // Guard very short targets: "pear" must not swallow "peas" via a 1-letter change if both exist.
      const limit = Math.min(max, allowedTypos(key.length));
      if (limit === 0) continue;
      const d = editDistance(typed, key, Math.min(best, limit));
      if (d > limit) continue;
      if (d < best) {
        best = d;
        bestId = id;
        tie = false;
      } else if (d === best && id !== bestId) {
        tie = true;
      }
    }
    return tie ? AMBIGUOUS : bestId;
  }

  /** Same pronunciation (consonant skeleton), plus a loose spelling check, with one clear winner. */
  private soundAlike(typed: string): number | null {
    if (typed.length < 4) return null;
    const sound = soundKey(typed);
    if (sound.length < 3) return null;
    const max = allowedTypos(typed.length) + 1;
    const found = new Set<number>();
    for (const { key, sound: s, id } of this.fuzzyKeys) {
      if (s !== sound) continue;
      if (typed.length <= 5 && vowelPattern(typed) !== vowelPattern(key)) continue;
      if (editDistance(typed, key, max) > max) continue;
      found.add(id);
    }
    return found.size === 1 ? [...found][0] : null;
  }

  /** A distinctive word (or its typo) that belongs to exactly one multi-word answer. */
  private partial(normalized: string): number | null {
    // One word only: "South Korea" must not partially match "North Korea".
    const tokens = normalized.split(" ").filter((t) => !DROPPABLE_WORDS.has(t));
    if (tokens.length !== 1 || tokens[0].length < 5 || GENERIC_WORDS.has(tokens[0])) return null;
    const word = singularize(tokens[0]);
    const exact = this.words.get(tokens[0]) ?? this.words.get(word);
    if (exact) return exact.size === 1 ? [...exact][0] : null;
    return null;
  }
}

/**
 * Validates a whole list of submissions in order (used by tests and batch re-validation).
 * The first submission of an answer is valid; later hits on the same canonical answer — even via a
 * different alias or spelling — are flagged as duplicates and never counted.
 */
export function validateSubmissions(index: TopicIndex, submissions: string[]): AnswerValidationResult[] {
  const credited = new Set<number>();
  const seenText = new Set<string>();
  return submissions.map((submittedAnswer) => {
    const m = index.match(submittedAnswer);
    const textDup = m.normalized !== "" && seenText.has(m.normalized);
    if (m.normalized) seenText.add(m.normalized);
    if (m.answerId === null) {
      return { submittedAnswer, canonicalAnswer: null, isValid: false, isDuplicate: textDup };
    }
    const dup = credited.has(m.answerId);
    credited.add(m.answerId);
    return { submittedAnswer, canonicalAnswer: m.canonical, isValid: true, isDuplicate: dup };
  });
}

export function countValidUnique(results: AnswerValidationResult[]): number {
  return results.filter((r) => r.isValid && !r.isDuplicate).length;
}
