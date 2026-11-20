import type { Difficulty } from "@/lib/db/schema";

/**
 * Seed data format.
 *
 * `answers` is a compact list: entries separated by "|" or new lines, aliases joined with "=".
 *   "United States=USA=US=America | United Kingdom=UK=Britain | France"
 * The first name is the canonical answer shown in results; the rest are accepted spellings.
 * Lines starting with "#" are comments.
 */
export interface TopicSeed {
  name: string;
  slug?: string;
  prompt?: string;
  description?: string;
  difficulty: Difficulty;
  answers: string;
  /**
   * False keeps the topic in the database but never deals it in a game — used for open-ended
   * topics (e.g. "lakes") where countless valid answers can't all be listed. Defaults to true.
   */
  active?: boolean;
}

export interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  /** lucide-react icon name (kebab-case). */
  icon: string;
  source?: string;
  topics: TopicSeed[];
}

export interface ParsedAnswer {
  canonical: string;
  aliases: string[];
}
