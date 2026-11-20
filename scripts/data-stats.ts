/**
 * Knowledge-base quality report. Run with `npm run data:stats`.
 * Prints totals and flags: duplicate answers, alias collisions, answers that collide after
 * loosening (spaces removed / singularized — those would be ambiguous at match time),
 * duplicate topic slugs, and topics too small to be dealt in a game.
 */
import { allCategories } from "../src/data/seed";
import { prepareTopic } from "../src/lib/seed/parse";
import { compact, keyVariants, singularize } from "../src/lib/validation/normalize";
import { MIN_TOPIC_ANSWERS } from "../src/server/round.service";
import { RETIRED_TOPICS } from "../src/data/seed/curation";
import { TopicIndex } from "../src/lib/validation/topic-index";

const verbose = process.argv.includes("--verbose");
// Distinct real answers whose loose forms overlap; exact matching keeps them apart.
const ALLOWED_LOOSE = new Set(["canadian-cities:St. John's:Saint John"]);
let topics = 0;
let activeTopics = 0;
let activeAnswers = 0;
const audit = process.argv.includes("--audit");
const prepared: { slug: string; active: boolean; answers: { canonical: string; normalized: string; aliases: { normalized: string }[] }[] }[] = [];
let answers = 0;
let aliases = 0;
const problems: string[] = [];
const slugs = new Map<string, string>();
const catSlugs = new Set<string>();
const perCategory: [string, number, number][] = [];

for (const cat of allCategories) {
  if (catSlugs.has(cat.slug)) problems.push(`duplicate category slug ${cat.slug}`);
  catSlugs.add(cat.slug);
  let catAnswers = 0;
  for (const t of cat.topics) {
    const p = prepareTopic(t);
    topics++;
    prepared.push(p);
    if (p.active) {
      activeTopics++;
      activeAnswers += p.answers.length;
    }
    answers += p.answers.length;
    catAnswers += p.answers.length;
    aliases += p.answers.reduce((n, a) => n + a.aliases.length, 0);
    if (slugs.has(p.slug)) problems.push(`duplicate topic slug "${p.slug}" (${slugs.get(p.slug)} / ${cat.slug})`);
    slugs.set(p.slug, cat.slug);
    if (p.active && p.answers.length < MIN_TOPIC_ANSWERS) problems.push(`[${p.slug}] only ${p.answers.length} answers`);
    for (const w of p.warnings) problems.push(`[${p.slug}] ${w}`);

    // Loose-key collisions between *different* answers.
    const owner = new Map<string, string>();
    for (const a of p.answers) {
      const keys = new Set<string>();
      for (const k of [a.normalized, ...a.aliases.map((x) => x.normalized)]) {
        for (const v of keyVariants(k)) {
          keys.add(compact(v));
          keys.add(compact(singularize(v)));
        }
      }
      for (const k of keys) {
        const o = owner.get(k);
        if (o && o !== a.canonical && !ALLOWED_LOOSE.has(`${p.slug}:${a.canonical}:${o}`)) problems.push(`[${p.slug}] "${a.canonical}" ~ "${o}" collide on "${k}"`);
        else owner.set(k, a.canonical);
      }
    }
    if (verbose) console.log(`  ${p.slug.padEnd(40)} ${p.answers.length}`);
  }
  perCategory.push([cat.name, cat.topics.length, catAnswers]);
}

console.log("\nCategory                         Topics  Answers");
for (const [n, t, a] of perCategory) console.log(`${n.padEnd(32)} ${String(t).padStart(6)} ${String(a).padStart(8)}`);
console.log(`\nTOTAL: ${allCategories.length} categories, ${topics} topics, ${answers} answers, ${aliases} aliases`);
console.log(`PLAYABLE: ${activeTopics} active topics, ${activeAnswers} answers (${topics - activeTopics} retired)`);
for (const s of RETIRED_TOPICS) if (!slugs.has(s)) problems.push(`retired slug "${s}" matches no topic`);

if (audit) {
  // Autocorrect false-positive audit: real answers from *other* topics in the same category
  // should almost never be fuzzily corrected into this topic's answers.
  let id = 0;
  const hits: string[] = [];
  const guarded: string[] = [];
  const lexicon = new Set(prepared.flatMap((p) => p.answers.flatMap((a) => [a.normalized, ...a.aliases.map((x) => x.normalized)])));
  const bySlugCat = new Map<string, string>();
  for (const cat of allCategories) for (const t of cat.topics) bySlugCat.set(prepareTopic(t).slug, cat.slug);
  const active = prepared.filter((p) => p.active);
  for (const p of active) {
    const index = new TopicIndex(
      p.answers.map((a) => ({ id: ++id, canonical: a.canonical, normalized: a.normalized, aliases: a.aliases.map((x) => x.normalized) })),
    );
    const own = new Set(p.answers.flatMap((a) => [a.normalized, ...a.aliases.map((x) => x.normalized)]));
    for (const other of active) {
      if (other === p || bySlugCat.get(other.slug) !== bySlugCat.get(p.slug)) continue;
      for (const a of other.answers) {
        if (own.has(a.normalized)) continue;
        const m = index.match(a.canonical);
        if (m.method !== "typo" && m.method !== "sound" && m.method !== "partial") continue;
        const g = index.match(a.canonical, { isKnownAnswer: (k) => lexicon.has(k) });
        if (g.answerId !== null)
          guarded.push(`[${p.slug}] "${a.canonical}" (${other.slug}) → "${g.canonical}" via ${g.method}`);
        else hits.push(`[${p.slug}] "${a.canonical}" (${other.slug}) → "${m.canonical}" via ${m.method}`);
      }
    }
  }
  console.log(`\nAutocorrect audit: ${hits.length + guarded.length} cross-topic fuzzy match(es); ${guarded.length} slip past the known-answer guard`);
  if (verbose) for (const h of hits.slice(0, 80)) console.log("  ~ " + h);
  for (const h of guarded.slice(0, 80)) console.log("  ! " + h);
}
if (problems.length) {
  console.log(`\n${problems.length} issue(s):`);
  for (const p of problems) console.log("  - " + p);
  process.exitCode = 1;
} else console.log("\nNo issues found.");
