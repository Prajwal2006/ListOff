import { allCategories } from "@/data/seed";

/** Static knowledge-base headline numbers, computed from the seed data at build time. */
export function LandingStats() {
  // Only topics that are dealt in games (open-ended ones are retired).
  const playable = allCategories.map((c) => ({ ...c, topics: c.topics.filter((t) => t.active !== false) }));
  const topics = playable.reduce((n, c) => n + c.topics.length, 0);
  const answers = playable.reduce(
    (n, c) => n + c.topics.reduce((m, t) => m + t.answers.split(/\n|\|/).filter((s) => s.trim()).length, 0),
    0,
  );
  const sample = playable.filter((c) => c.topics.length).flatMap((c) => c.topics.slice(0, 2).map((t) => t.name)).slice(0, 28);
  const stats = [
    { n: playable.filter((c) => c.topics.length).length, label: "categories" },
    { n: topics, label: "topics" },
    { n: Math.floor(answers / 1000) * 1000, label: "answers", plus: true },
  ];
  return (
    <div className="mt-16">
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <div className="font-display text-5xl font-black tabular text-volt sm:text-7xl">
              {s.n.toLocaleString()}
              {s.plus && "+"}
            </div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {sample.map((t) => (
          <span key={t} className="rounded-full border border-line bg-night/60 px-3 py-1.5 text-sm text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
