import { parseAnswers, slugify } from "@/lib/seed/parse";
import type { CategorySeed, TopicSeed } from "@/lib/seed/types";
import { compact, normalizeAnswer, singularize } from "@/lib/validation/normalize";
import { animals } from "./animals";
import { NEW_TOPICS } from "./bounded";
import { culture } from "./culture";
import { EXTRA_ANSWERS, RETIRED_TOPICS } from "./curation";
import { entertainment } from "./entertainment";
import { food } from "./food";
import { general } from "./general";
import { geography } from "./geography";
import { oddsAndEnds } from "./odds-and-ends";
import { popCulture } from "./pop-culture";
import { science } from "./science";
import { sports } from "./sports";
import { technology } from "./technology";

const base: CategorySeed[] = [
  ...food,
  ...geography,
  ...animals,
  ...entertainment,
  ...popCulture,
  ...science,
  ...technology,
  ...sports,
  ...general,
  ...culture,
  ...oddsAndEnds,
];

/** Plural- and spacing-insensitive key, so "Bean sprouts" and "Bean sprout" count as the same answer. */
const mergeKey = (s: string) => compact(singularize(normalizeAnswer(s)));

/** Appends extra answers, skipping any whose name (or alias) the topic already knows. */
function mergeAnswers(topic: TopicSeed, extra: string | undefined): string {
  if (!extra) return topic.answers;
  const known = new Set(parseAnswers(topic.answers).flatMap((a) => [a.canonical, ...a.aliases].map(mergeKey)));
  const additions = parseAnswers(extra).filter((a) => {
    const keys = [a.canonical, ...a.aliases].map(mergeKey);
    if (keys.some((k) => known.has(k))) return false;
    keys.forEach((k) => known.add(k));
    return true;
  });
  if (!additions.length) return topic.answers;
  return `${topic.answers}|${additions.map((a) => [a.canonical, ...a.aliases].join("=")).join("|")}`;
}

const slugOf = (t: TopicSeed) => t.slug ?? slugify(t.name);

export const allCategories: CategorySeed[] = base.map((cat) => ({
  ...cat,
  topics: [...cat.topics, ...(NEW_TOPICS[cat.slug] ?? [])].map((t) => ({
    ...t,
    answers: mergeAnswers(t, EXTRA_ANSWERS[slugOf(t)]),
    active: t.active ?? !RETIRED_TOPICS.has(slugOf(t)),
  })),
}));
