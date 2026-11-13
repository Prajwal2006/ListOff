"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { api } from "@/lib/client/api";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";

type Cat = Awaited<ReturnType<typeof api.categories>>["categories"][number];

/** Optional category filter. Empty selection means "everything". */
export function CategoryPicker({ value, onChange }: { value: number[]; onChange: (ids: number[]) => void }) {
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    api
      .categories()
      .then((r) => setCats(r.categories.filter((c) => c.topicCount > 0)))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <p className="text-sm text-hot">Couldn&apos;t load categories. Every category will be used.</p>;
  if (!cats)
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="h-10 w-32 animate-pulse rounded-xl bg-deck" />
        ))}
      </div>
    );

  const all = value.length === 0;
  const toggle = (id: number) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange([])}
        className={cn(
          "flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition",
          all ? "border-volt bg-volt/15 text-volt" : "border-line-strong bg-night text-muted-foreground hover:text-text",
        )}
      >
        {all && <Check className="size-4" />} Everything
      </button>
      {cats.map((c) => {
        const on = value.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(c.id)}
            className={cn(
              "flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition",
              on ? "border-uv bg-uv/20 text-text" : "border-line-strong bg-night text-muted-foreground hover:text-text",
            )}
          >
            <CategoryIcon name={c.icon} className="size-4" />
            {c.name}
            <span className="text-xs text-faint">{c.topicCount}</span>
          </button>
        );
      })}
    </div>
  );
}
