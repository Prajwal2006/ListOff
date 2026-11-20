import { normalizeAnswer } from "@/lib/validation/normalize";
import type { CategorySeed, ParsedAnswer, TopicSeed } from "./types";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Parses the compact "Canonical=alias=alias | Next" format into answer records. */
export function parseAnswers(src: string): ParsedAnswer[] {
  const out: ParsedAnswer[] = [];
  for (const raw of src.split(/\n|\|/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const [canonical, ...aliases] = line.split("=").map((s) => s.trim()).filter(Boolean);
    if (canonical) out.push({ canonical, aliases });
  }
  return out;
}

export function topicSlug(t: TopicSeed): string {
  return t.slug ?? slugify(t.name);
}

/** Topic names that start with a proper noun keep their capital in the generated prompt. */
const PROPER_STARTS = new Set(
  ("African Asian Australian Beatles Bollywood Brazilian British Canadian Caribbean Chinese Christmas Disney " +
    "DreamWorks Egyptian English European French German Greek Harry Hindu Indian Italian James Japanese K-pop " +
    "Latin Lord Marvel Mexican Middle Mughal Norse Pixar Pokémon Roald Roman Shakespeare Southeast Star Studio " +
    "Taylor Thai").split(" "),
);

export function topicPrompt(t: TopicSeed): string {
  if (t.prompt) return t.prompt;
  const first = t.name.split(" ")[0];
  if (first === "The") return `Name as many of ${t.name.charAt(0).toLowerCase() + t.name.slice(1)} as you can`;
  // Keep proper nouns and acronyms as written: "NATO member countries", "Indian state capitals".
  const keep = /^[^a-z]{2}/.test(first) || PROPER_STARTS.has(first);
  const n = keep ? t.name : t.name.charAt(0).toLowerCase() + t.name.slice(1);
  return `Name as many ${n} as you can`;
}

export interface PreparedTopic {
  slug: string;
  name: string;
  prompt: string;
  description: string;
  difficulty: TopicSeed["difficulty"];
  active: boolean;
  answers: { canonical: string; normalized: string; aliases: { alias: string; normalized: string }[] }[];
  warnings: string[];
}

/** Normalizes, de-duplicates, and checks one topic's answers for collisions. */
export function prepareTopic(t: TopicSeed): PreparedTopic {
  const warnings: string[] = [];
  const seen = new Map<string, string>(); // normalized key -> canonical owner
  const answers: PreparedTopic["answers"] = [];

  for (const a of parseAnswers(t.answers)) {
    const normalized = normalizeAnswer(a.canonical);
    if (!normalized) {
      warnings.push(`empty after normalization: "${a.canonical}"`);
      continue;
    }
    const owner = seen.get(normalized);
    if (owner) {
      warnings.push(`duplicate answer "${a.canonical}" (already "${owner}")`);
      continue;
    }
    seen.set(normalized, a.canonical);
    const aliases: { alias: string; normalized: string }[] = [];
    for (const alias of a.aliases) {
      const n = normalizeAnswer(alias);
      if (!n || n === normalized) continue;
      const aliasOwner = seen.get(n);
      if (aliasOwner && aliasOwner !== a.canonical) {
        warnings.push(`alias "${alias}" of "${a.canonical}" collides with "${aliasOwner}"`);
        continue;
      }
      if (aliases.some((x) => x.normalized === n)) continue;
      seen.set(n, a.canonical);
      aliases.push({ alias, normalized: n });
    }
    answers.push({ canonical: a.canonical, normalized, aliases });
  }

  return {
    slug: topicSlug(t),
    name: t.name,
    prompt: topicPrompt(t),
    description: t.description ?? "",
    difficulty: t.difficulty,
    active: t.active ?? true,
    answers,
    warnings,
  };
}

export function prepareAll(cats: CategorySeed[]) {
  return cats.map((c) => ({ ...c, prepared: c.topics.map(prepareTopic) }));
}
