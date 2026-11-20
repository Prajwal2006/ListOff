"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, GraduationCap, MapPin, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ArcadeButton } from "@/components/game/arcade-button";
import { COUNTRIES, REGIONS, type CountryCode } from "@/data/regions";
import { ApiError } from "@/lib/client/api";
import { soloApi } from "@/lib/client/solo-api";
import { cn } from "@/lib/utils";
import type { SoloProfileView, UniversityView } from "@/types/solo";

const field =
  "h-14 w-full rounded-2xl border border-line-strong bg-ink/60 px-4 text-lg placeholder:text-faint focus:border-volt focus:outline-none";

/** Create or edit the player's solo identity: display name, country, state and university. */
export function ProfileForm({
  initial,
  defaultName,
  onSaved,
  submitLabel = "Save and play",
}: {
  initial?: SoloProfileView | null;
  defaultName?: string;
  onSaved: (p: SoloProfileView) => void;
  submitLabel?: string;
}) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? (defaultName ?? "").slice(0, 20));
  const [country, setCountry] = useState<CountryCode>(initial?.country ?? "IN");
  const [stateCode, setStateCode] = useState(initial?.stateCode ?? "");
  const [uni, setUni] = useState<UniversityView | null>(initial?.university ?? null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UniversityView[]>([]);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  // Search as you type (debounced). Same-state universities come first.
  useEffect(() => {
    let live = true;
    const t = setTimeout(() => {
      soloApi
        .universities(country, stateCode || undefined, query.trim() || undefined)
        .then((r) => live && setResults(r.universities))
        .catch(() => live && setResults([]));
    }, 200);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [country, stateCode, query]);

  function pickCountry(c: CountryCode) {
    if (c === country) return;
    setCountry(c);
    setStateCode("");
    setUni(null);
  }

  async function addUni() {
    if (!stateCode) {
      toast.error("Pick your state first — new universities are added to it.");
      return;
    }
    setAdding(true);
    try {
      const { university } = await soloApi.addUniversity({ name: query.trim(), country, stateCode });
      setUni(university);
      setQuery("");
      toast.success(university.isCustom ? "Added your university" : "Found it on the list");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't add that university.");
    } finally {
      setAdding(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!stateCode) return toast.error("Pick your state.");
    if (!uni) return toast.error("Pick your university.");
    setBusy(true);
    try {
      const { profile } = await soloApi.saveProfile({ displayName: displayName.trim(), country, stateCode, universityId: uni.id });
      onSaved(profile);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save your profile.");
    } finally {
      setBusy(false);
    }
  }

  const exact = results.some((r) => r.name.toLowerCase() === query.trim().toLowerCase());
  const regionLabel = COUNTRIES.find((c) => c.code === country)!.regionLabel;

  return (
    <form onSubmit={save} className="space-y-6 text-left">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-muted-foreground">Leaderboard name</span>
        <input
          required
          maxLength={20}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Quiz Wizard"
          className={cn(field, "font-display text-2xl font-extrabold uppercase tracking-wide")}
        />
      </label>

      <div>
        <span className="mb-2 block text-sm font-semibold text-muted-foreground">Country</span>
        <div className="grid grid-cols-2 gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => pickCountry(c.code)}
              className={cn(
                "flex h-14 items-center justify-center gap-2 rounded-2xl border text-lg font-bold transition",
                country === c.code ? "border-volt bg-volt/10 text-volt" : "border-line-strong bg-ink/60 hover:border-line-strong/80",
              )}
            >
              <span className="text-2xl" aria-hidden>
                {c.flag}
              </span>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <MapPin className="size-4" /> {regionLabel}
        </span>
        <select required value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={cn(field, "appearance-none")}>
          <option value="" disabled>
            Choose your {regionLabel.toLowerCase()}…
          </option>
          {REGIONS[country].map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <GraduationCap className="size-4" /> University
        </span>
        <AnimatePresence mode="wait" initial={false}>
          {uni ? (
            <motion.div
              key="picked"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-2xl border border-volt/50 bg-volt/10 p-4"
            >
              <Check className="size-5 shrink-0 text-volt" />
              <span className="min-w-0 flex-1 font-semibold">{uni.name}</span>
              <button type="button" onClick={() => setUni(null)} className="text-sm font-semibold text-cyan hover:underline">
                Change
              </button>
            </motion.div>
          ) : (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search — e.g. IIT Bombay, Stanford"
                  className={cn(field, "pl-12")}
                />
              </div>
              <ul className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-line bg-ink/50 p-1">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setUni(r)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-deck"
                    >
                      <span className="min-w-0 flex-1">{r.name}</span>
                      <span className="shrink-0 font-mono text-xs text-faint">{r.stateCode}</span>
                    </button>
                  </li>
                ))}
                {!results.length && <li className="px-3 py-3 text-sm text-faint">No matches yet.</li>}
              </ul>
              {query.trim().length >= 4 && !exact && (
                <button
                  type="button"
                  disabled={adding}
                  onClick={addUni}
                  className="mt-2 flex w-full items-center gap-2 rounded-2xl border border-dashed border-cyan/60 px-4 py-3 text-left text-sm font-semibold text-cyan hover:bg-cyan/10 disabled:opacity-50"
                >
                  <Plus className="size-4 shrink-0" /> Not listed? Add “{query.trim()}”
                  {stateCode ? "" : " (pick your state first)"}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ArcadeButton type="submit" size="xl" className="w-full" loading={busy}>
        {submitLabel}
      </ArcadeButton>
    </form>
  );
}
