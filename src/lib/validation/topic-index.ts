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

export interface MatchResult {
  answerId: number | null;
  canonical: string | null;
  normalized: string;
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
 */
export class TopicIndex {
  private primary = new Map<string, number>();
  private loose = new Map<string, number>();
  private byId = new Map<number, IndexedAnswer>();

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

  match(submitted: string): MatchResult {
    const normalized = normalizeAnswer(submitted);
    if (!normalized) return { answerId: null, canonical: null, normalized };
    const sing = singularize(normalized);
    let id = this.primary.get(normalized) ?? this.primary.get(sing);
    if (id === undefined) {
      for (const lk of [compact(normalized), compact(sing)]) {
        const hit = this.loose.get(lk);
        if (hit !== undefined && hit !== AMBIGUOUS) {
          id = hit;
          break;
        }
      }
    }
    if (id === undefined) return { answerId: null, canonical: null, normalized };
    return { answerId: id, canonical: this.byId.get(id)!.canonical, normalized };
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
