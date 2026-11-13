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

const verbose = process.argv.includes("--verbose");
// Distinct real answers whose loose forms overlap; exact matching keeps them apart.
const ALLOWED_LOOSE = new Set(["canadian-cities:St. John's:Saint John"]);
let topics = 0;
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
    answers += p.answers.length;
    catAnswers += p.answers.length;
    aliases += p.answers.reduce((n, a) => n + a.aliases.length, 0);
    if (slugs.has(p.slug)) problems.push(`duplicate topic slug "${p.slug}" (${slugs.get(p.slug)} / ${cat.slug})`);
    slugs.set(p.slug, cat.slug);
    if (p.answers.length < MIN_TOPIC_ANSWERS) problems.push(`[${p.slug}] only ${p.answers.length} answers`);
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
if (problems.length) {
  console.log(`\n${problems.length} issue(s):`);
  for (const p of problems) console.log("  - " + p);
  process.exitCode = 1;
} else console.log("\nNo issues found.");
