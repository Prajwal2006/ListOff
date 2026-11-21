"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ArcadeButton } from "@/components/game/arcade-button";
import { Switch } from "@/components/ui/switch";
import { api as gameApi } from "@/lib/client/api";
import { cn } from "@/lib/utils";
import { adminFetch } from "./admin-fetch";

type TopicRow = {
  id: number;
  name: string;
  slug: string;
  prompt: string;
  difficulty: string;
  isActive: boolean;
  category: string;
  answerCount: number;
};
type AnswerRow = { id: number; canonical: string; isActive: boolean; aliases: string[] };

/** Browse topics, toggle them, and add or disable answers. */
export function KnowledgeBase({ secret, initialTopicId }: { secret: string; initialTopicId?: number }) {
  const [q, setQ] = useState("");
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [selected, setSelected] = useState<TopicRow | null>(null);

  const load = useCallback(
    async (query = q) => {
      try {
        const r = await adminFetch<{ topics: TopicRow[] }>(secret, `/api/admin/topics?q=${encodeURIComponent(query)}`);
        setTopics(r.topics);
        setSelected((cur) => cur ?? r.topics.find((t) => t.id === initialTopicId) ?? null);
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [secret, q, initialTopicId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <section className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search topics or categories"
              className="h-11 w-full rounded-xl border border-line-strong bg-night pl-9 pr-3 focus:border-uv focus:outline-none"
            />
          </div>
          <ArcadeButton size="md" variant="ghost" type="submit">
            Search
          </ArcadeButton>
        </form>
        <NewTopic secret={secret} onCreated={() => load()} />
        <ul className="max-h-[70dvh] space-y-1 overflow-y-auto pr-1">
          {topics.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setSelected(t)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left",
                  selected?.id === t.id ? "border-uv bg-uv/10" : "border-line bg-night/60 hover:border-line-strong",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate font-semibold", !t.isActive && "text-faint line-through")}>{t.name}</span>
                  <span className="text-xs text-faint">
                    {t.category} · {t.difficulty}
                  </span>
                </span>
                <span className="font-display text-lg font-black tabular text-muted-foreground">{t.answerCount}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        {selected ? (
          <TopicEditor key={selected.id} topic={selected} secret={secret} onChanged={() => load()} />
        ) : (
          <p className="panel p-6 text-muted-foreground">Pick a topic to view and extend its answers.</p>
        )}
      </section>
    </div>
  );
}

function NewTopic({ secret, onCreated }: { secret: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({ name: "", categoryId: "", difficulty: "medium", prompt: "", answers: "" });
  useEffect(() => {
    if (open && !cats.length) gameApi.categories().then((r) => setCats(r.categories));
  }, [open, cats.length]);
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="flex w-full items-center gap-2 rounded-xl border border-dashed border-volt/50 p-3 text-volt">
        <Plus className="size-4" /> New topic
      </button>
    );
  return (
    <form
      className="panel space-y-3 p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          const r = await adminFetch<{ result: { added: number } | null }>(secret, "/api/admin/topics", {
            method: "POST",
            body: JSON.stringify({ ...form, categoryId: Number(form.categoryId) }),
          });
          toast.success(`Topic created with ${r.result?.added ?? 0} answers`);
          setOpen(false);
          setForm({ name: "", categoryId: "", difficulty: "medium", prompt: "", answers: "" });
          onCreated();
        } catch (err) {
          toast.error((err as Error).message);
        }
      }}
    >
      <input required placeholder="Topic name, e.g. Pasta shapes" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-xl border border-line-strong bg-ink/60 px-3" />
      <div className="flex gap-2">
        <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="h-11 flex-1 rounded-xl border border-line-strong bg-ink/60 px-3">
          <option value="">Category…</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="h-11 rounded-xl border border-line-strong bg-ink/60 px-3">
          <option>easy</option>
          <option>medium</option>
          <option>hard</option>
        </select>
      </div>
      <input placeholder="Reveal prompt (optional)" value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} className="h-11 w-full rounded-xl border border-line-strong bg-ink/60 px-3" />
      <textarea placeholder={"Answers: one per line or separated by |\nAdd aliases with =, e.g. Kiwi=Kiwifruit"} value={form.answers} onChange={(e) => setForm({ ...form, answers: e.target.value })} rows={6} className="w-full rounded-xl border border-line-strong bg-ink/60 p-3 font-mono text-sm" />
      <div className="flex gap-2">
        <ArcadeButton size="md" type="submit">
          Create topic
        </ArcadeButton>
        <ArcadeButton size="md" variant="ghost" type="button" onClick={() => setOpen(false)}>
          Cancel
        </ArcadeButton>
      </div>
    </form>
  );
}

function TopicEditor({ topic, secret, onChanged }: { topic: TopicRow; secret: string; onChanged: () => void }) {
  const [answers, setAnswers] = useState<AnswerRow[] | null>(null);
  const [add, setAdd] = useState("");
  const [active, setActive] = useState(topic.isActive);
  const reload = useCallback(
    () => adminFetch<{ answers: AnswerRow[] }>(secret, `/api/admin/topics/${topic.id}`).then((r) => setAnswers(r.answers)),
    [secret, topic.id],
  );
  useEffect(() => {
    reload().catch((e) => toast.error(e.message));
  }, [reload]);

  return (
    <div className="panel space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan">{topic.category}</p>
          <h2 className="font-display text-4xl font-black uppercase leading-none">{topic.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{topic.prompt}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          Active
          <Switch
            checked={active}
            onCheckedChange={async (v) => {
              setActive(v);
              try {
                await adminFetch(secret, `/api/admin/topics/${topic.id}`, { method: "PATCH", body: JSON.stringify({ isActive: v }) });
                onChanged();
              } catch (e) {
                setActive(!v);
                toast.error((e as Error).message);
              }
            }}
          />
        </label>
      </div>
      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const r = await adminFetch<{ added: number; total: number; warnings: string[] }>(secret, `/api/admin/topics/${topic.id}`, {
              method: "POST",
              body: JSON.stringify({ answers: add }),
            });
            toast.success(`Added ${r.added} new answers (${r.total} processed)`);
            r.warnings.slice(0, 3).forEach((w) => toast.warning(w));
            setAdd("");
            reload();
            onChanged();
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
      >
        <textarea value={add} onChange={(e) => setAdd(e.target.value)} rows={4} placeholder="Add answers: Mango | Kiwi=Kiwifruit | Lychee=Litchi" className="w-full rounded-xl border border-line-strong bg-ink/60 p-3 font-mono text-sm" />
        <ArcadeButton size="md" type="submit" disabled={!add.trim()}>
          Add answers
        </ArcadeButton>
      </form>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">{answers?.length ?? "…"} answers — click one to disable or re-enable it</p>
        <ul className="flex max-h-[50dvh] flex-wrap gap-1.5 overflow-y-auto">
          {answers?.map((a) => (
            <li key={a.id}>
              <button
                title={a.aliases.length ? `Also accepts: ${a.aliases.join(", ")}` : undefined}
                onClick={async () => {
                  try {
                    await adminFetch(secret, `/api/admin/answers/${a.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !a.isActive }) });
                    setAnswers((list) => list?.map((x) => (x.id === a.id ? { ...x, isActive: !x.isActive } : x)) ?? null);
                  } catch (e) {
                    toast.error((e as Error).message);
                  }
                }}
                className={cn(
                  "rounded-lg border px-2 py-1 text-sm",
                  a.isActive ? "border-line-strong bg-deck/60" : "border-line text-faint line-through",
                )}
              >
                {a.canonical}
                {a.aliases.length > 0 && <span className="ml-1 text-xs text-faint">+{a.aliases.length}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
