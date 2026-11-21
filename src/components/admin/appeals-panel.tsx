"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { ArcadeButton } from "@/components/game/arcade-button";
import { cn } from "@/lib/utils";
import { adminFetch } from "./admin-fetch";

type Status = "PENDING" | "APPROVED" | "REJECTED";
type Appeal = {
  id: number;
  topicId: number;
  topic: string;
  text: string;
  note: string | null;
  status: Status;
  reportCount: number;
  lastReportedAt: string;
};

const TABS: { key: Status; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

/** Player appeals: "I think this answer should have counted". Approving adds it to the topic. */
export function AppealsPanel({ secret, onOpenTopic, onChanged }: { secret: string; onOpenTopic: (id: number) => void; onChanged: () => void }) {
  const [status, setStatus] = useState<Status>("PENDING");
  const [appeals, setAppeals] = useState<Appeal[] | null>(null);

  const load = useCallback(async () => {
    try {
      setAppeals((await adminFetch<{ appeals: Appeal[] }>(secret, `/api/admin/appeals?status=${status}`)).appeals);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [secret, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 self-start rounded-xl border border-line bg-night/60 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setAppeals(null);
              setStatus(t.key);
            }}
            className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", status === t.key ? "bg-uv text-white" : "text-muted-foreground hover:text-text")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {appeals === null ? (
        <p className="panel p-6 text-muted-foreground">Loading…</p>
      ) : appeals.length === 0 ? (
        <p className="panel p-6 text-muted-foreground">No {status.toLowerCase()} appeals.</p>
      ) : (
        <ul className="space-y-3">
          {appeals.map((a) => (
            <AppealCard
              key={a.id}
              appeal={a}
              secret={secret}
              onOpenTopic={onOpenTopic}
              onDone={() => {
                load();
                onChanged();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AppealCard({ appeal, secret, onOpenTopic, onDone }: { appeal: Appeal; secret: string; onOpenTopic: (id: number) => void; onDone: () => void }) {
  const [answer, setAnswer] = useState(appeal.text);
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject" | "reopen") {
    setBusy(true);
    try {
      const r = await adminFetch<{ added?: number }>(secret, `/api/admin/appeals/${appeal.id}`, {
        method: "POST",
        body: JSON.stringify({ action, answer }),
      });
      toast.success(action === "approve" ? (r.added ? `Added to ${appeal.topic}` : "Already existed — alias saved") : action === "reject" ? "Rejected" : "Reopened");
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="panel space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-3xl font-black leading-none">{appeal.text}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            for{" "}
            <button onClick={() => onOpenTopic(appeal.topicId)} className="font-semibold text-cyan hover:underline">
              {appeal.topic}
            </button>{" "}
            · reported {appeal.reportCount}× · last {new Date(appeal.lastReportedAt).toLocaleString()}
          </p>
          {appeal.note && <p className="mt-1 text-sm italic text-faint">“{appeal.note}”</p>}
        </div>
      </div>
      {appeal.status === "PENDING" ? (
        <>
          <label className="block text-xs text-faint">
            Add as (use <code>Canonical=alias</code> to make it an alias of an existing answer, e.g. <code>Kiwi=Kiwifruit</code>)
            <input value={answer} onChange={(e) => setAnswer(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line-strong bg-ink/60 px-3 text-sm text-text" />
          </label>
          <div className="flex gap-2">
            <ArcadeButton size="md" disabled={busy || !answer.trim()} onClick={() => act("approve")}>
              <Check className="size-4" /> Approve &amp; add
            </ArcadeButton>
            <ArcadeButton size="md" variant="ghost" disabled={busy} onClick={() => act("reject")}>
              <X className="size-4" /> Reject
            </ArcadeButton>
          </div>
        </>
      ) : (
        <ArcadeButton size="md" variant="ghost" disabled={busy} onClick={() => act("reopen")}>
          <RotateCcw className="size-4" /> Move back to pending
        </ArcadeButton>
      )}
    </li>
  );
}
